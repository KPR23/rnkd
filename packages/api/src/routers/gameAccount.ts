import {
	cs2FaceitGameAccountProfiles,
	db,
	gameAccounts,
	GAMES,
	lolGameAccountProfiles,
	lolRankedEntries,
	RIOT_REGIONAL_ROUTE,
	type RiotPlatformRoute,
	type RiotRegionalRoute,
} from "@repo/db";
import {
	isCs2FaceitGameAccount,
	isLolGameAccount,
	type GameAccount,
} from "@repo/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { isValidPlatformRoute } from "../services/riot/helper";
import { syncLolForAccount } from "../services/riot/lol-sync-runner";
import {
	getAccountByRiotId,
	getLolAccountDetails,
	getLolActiveRegionByPuuid,
	getLolLeagueEntriesByPuuid,
} from "../services/riot/riot";
import { protectedProcedure, router } from "../trpc";

const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);

const isGameAccountUniqueViolation = (error: unknown) => {
	if (!error || typeof error !== "object") return false;

	const err = error as {
		code?: string;
		constraint?: string;
		cause?: { code?: string; constraint?: string };
	};

	const code = err.code ?? err.cause?.code;
	const constraint = err.constraint ?? err.cause?.constraint;

	if (constraint === "game_accounts_game_external_unique") return true;
	if (code === "23505") return true;

	return false;
};

const LOL_PROFILE_REFRESH_TTL_MS = 1000 * 60 * 30;

type GameAccountRecord = typeof gameAccounts.$inferSelect & {
	lolProfile: typeof lolGameAccountProfiles.$inferSelect | null;
	cs2FaceitProfile: typeof cs2FaceitGameAccountProfiles.$inferSelect | null;
};

function mapGameAccountRecord(account: GameAccountRecord): GameAccount {
	const { lolProfile, cs2FaceitProfile, ...baseAccount } = account;

	switch (baseAccount.gameId) {
		case GAMES.LOL:
			if (!lolProfile) {
				throw new Error("Missing LoL profile for game account");
			}

			return {
				...baseAccount,
				gameId: GAMES.LOL,
				profile: lolProfile,
			};
		case GAMES.CS2_FACEIT:
			return {
				...baseAccount,
				gameId: GAMES.CS2_FACEIT,
				profile: cs2FaceitProfile,
			};
		default:
			throw new Error(`Unsupported game account type: ${baseAccount.gameId}`);
	}
}

function refreshLolAccountDataInBackground(
	accountId: string,
	externalId: string,
	platformRoute: RiotPlatformRoute,
) {
	void (async () => {
		try {
			const [details, entries] = await Promise.all([
				getLolAccountDetails(externalId, platformRoute),
				getLolLeagueEntriesByPuuid(externalId, platformRoute),
			]);

			await db.transaction(async (tx) => {
				await tx
					.update(lolGameAccountProfiles)
					.set({
						profileIconId: details.profileIconId,
						summonerLevel: details.summonerLevel,
					})
					.where(eq(lolGameAccountProfiles.gameAccountId, accountId));

				await tx
					.update(gameAccounts)
					.set({
						lastSyncedAt: new Date(),
					})
					.where(eq(gameAccounts.id, accountId));

				await tx
					.delete(lolRankedEntries)
					.where(
						and(
							eq(lolRankedEntries.gameAccountId, accountId),
							eq(lolRankedEntries.gameId, GAMES.LOL),
						),
					);

				if (entries.length === 0) {
					return;
				}

				const syncedAt = new Date();
				await tx.insert(lolRankedEntries).values(
					entries.map((entry) => ({
						gameAccountId: accountId,
						gameId: GAMES.LOL,
						queueType: entry.queueType,
						tier: entry.tier,
						rank: entry.rank || null,
						leaguePoints: entry.leaguePoints,
						wins: entry.wins,
						losses: entry.losses,
						hotStreak: entry.hotStreak,
						inactive: entry.inactive,
						syncedAt,
					})),
				);
			});
		} catch (error) {
			console.error(error);
		}
	})();
}

const RANKED_SOLO = "RANKED_SOLO_5x5";
const RANKED_FLEX = "RANKED_FLEX_SR";

function pickPrimaryLolRankedEntry<T extends { queueType: string }>(
	rows: T[],
): T | null {
	if (rows.length === 0) {
		return null;
	}

	return (
		rows.find((row) => row.queueType === RANKED_SOLO) ??
		rows.find((row) => row.queueType === RANKED_FLEX) ??
		rows[0] ??
		null
	);
}

export const gameAccountRouter = router({
	getGameAccounts: protectedProcedure.query(async ({ ctx }) => {
		const accounts = await db.query.gameAccounts.findMany({
			where: eq(gameAccounts.userId, ctx.session.user.id),
			with: {
				lolProfile: true,
				cs2FaceitProfile: true,
			},
		});

		for (const account of accounts) {
			if (account.gameId !== GAMES.LOL || !account.lolProfile) {
				continue;
			}

			const shouldRefresh =
				!account.lastSyncedAt ||
				Date.now() - account.lastSyncedAt.getTime() >
					LOL_PROFILE_REFRESH_TTL_MS;
			if (!shouldRefresh) continue;

			refreshLolAccountDataInBackground(
				account.id,
				account.externalId,
				account.lolProfile.platformRoute as RiotPlatformRoute,
			);
		}

		const normalizedAccounts = accounts.flatMap((account) => {
			try {
				return [mapGameAccountRecord(account)];
			} catch (error) {
				console.error("Skipping malformed game account", {
					accountId: account.id,
					error,
				});
				return [];
			}
		});

		return {
			lol: normalizedAccounts.filter(isLolGameAccount),
			faceit: normalizedAccounts.filter(isCs2FaceitGameAccount),
		};
	}),
	getLolProfileDisplay: protectedProcedure
		.input(z.object({ gameAccountId: z.uuid() }))
		.query(async ({ input }) => {
			const accountRecord = await db.query.gameAccounts.findFirst({
				where: eq(gameAccounts.id, input.gameAccountId),
				with: {
					lolProfile: true,
					cs2FaceitProfile: true,
				},
			});

			if (!accountRecord) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const account = mapGameAccountRecord(accountRecord);

			if (!isLolGameAccount(account)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Not a League of Legends account",
				});
			}

			const rankedRows = await db.query.lolRankedEntries.findMany({
				where: eq(lolRankedEntries.gameAccountId, input.gameAccountId),
			});

			const primaryRanked = pickPrimaryLolRankedEntry(rankedRows);

			const rankedSoloDuo =
				rankedRows.find((row) => row.queueType === RANKED_SOLO) ?? null;
			const rankedFlex =
				rankedRows.find((row) => row.queueType === RANKED_FLEX) ?? null;

			let rankedWinRate = 0;
			if (primaryRanked) {
				const played = primaryRanked.wins + primaryRanked.losses;
				rankedWinRate = played > 0 ? (primaryRanked.wins / played) * 100 : 0;
			}

			return {
				gameAccount: account,
				ranked: primaryRanked,
				rankedSoloDuo,
				rankedFlex,
				rankedWinRate,
			};
		}),
	getLolDetailsDemo: protectedProcedure
		.input(
			z.object({
				puuid: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { puuid } = input;

			const existingAccount = await db.query.gameAccounts.findFirst({
				where: and(
					eq(gameAccounts.gameId, GAMES.LOL),
					eq(gameAccounts.externalId, puuid),
				),
			});

			if (!existingAccount) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const matchesSynced = await syncLolForAccount(existingAccount.id, 5);

			return { success: true, matchesSynced };
		}),
	addLolAccount: protectedProcedure
		.input(
			z.object({
				gameName: z.string().min(3, "Game name min. 3 characters").max(16),
				tagLine: z.string().min(3, "Tag line min. 3 characters").max(5),
				region: riotRegionalRouteSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const riotAccount = await getAccountByRiotId(
				input.gameName,
				input.tagLine,
				input.region,
			);

			const existingAccount = await db.query.gameAccounts.findFirst({
				where: and(
					eq(gameAccounts.gameId, GAMES.LOL),
					eq(gameAccounts.externalId, riotAccount.puuid),
				),
			});

			if (existingAccount) {
				throw new TRPCError({ code: "CONFLICT" });
			}

			const activeRegion = await getLolActiveRegionByPuuid(
				riotAccount.puuid,
				input.region,
			);

			if (!isValidPlatformRoute(activeRegion)) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Unsupported platform region: ${activeRegion}`,
				});
			}

			const details = await getLolAccountDetails(
				riotAccount.puuid,
				activeRegion,
			);

			try {
				const createdAccount = await db.transaction(async (tx) => {
					const [gameAccount] = await tx
						.insert(gameAccounts)
						.values({
							id: crypto.randomUUID(),
							userId: ctx.session.user.id,
							gameId: GAMES.LOL,
							externalId: riotAccount.puuid,
							lastSyncedAt: new Date(),
						})
						.returning();

					if (!gameAccount) {
						throw new Error("Failed to create LoL game account");
					}

					const [lolProfile] = await tx
						.insert(lolGameAccountProfiles)
						.values({
							gameAccountId: gameAccount.id,
							gameId: GAMES.LOL,
							gameName: riotAccount.gameName,
							tagLine: riotAccount.tagLine,
							profileIconId: details.profileIconId,
							summonerLevel: details.summonerLevel,
							regionalRoute: input.region as RiotRegionalRoute,
							platformRoute: activeRegion as RiotPlatformRoute,
						})
						.returning();

					if (!lolProfile) {
						throw new Error("Failed to create LoL account profile");
					}

					return mapGameAccountRecord({
						...gameAccount,
						lolProfile,
						cs2FaceitProfile: null,
					});
				});

				if (!isLolGameAccount(createdAccount)) {
					throw new Error("Created account is not a LoL account");
				}

				try {
					const entries = await getLolLeagueEntriesByPuuid(
						createdAccount.externalId,
						createdAccount.profile.platformRoute,
					);

					if (entries.length > 0) {
						const syncedAt = new Date();
						await db.insert(lolRankedEntries).values(
							entries.map((entry) => ({
								gameAccountId: createdAccount.id,
								gameId: GAMES.LOL,
								queueType: entry.queueType,
								tier: entry.tier,
								rank: entry.rank || null,
								leaguePoints: entry.leaguePoints,
								wins: entry.wins,
								losses: entry.losses,
								hotStreak: entry.hotStreak,
								inactive: entry.inactive,
								syncedAt,
							})),
						);
					}
				} catch (rankedError) {
					console.error(rankedError);
				}

				return createdAccount;
			} catch (error) {
				if (isGameAccountUniqueViolation(error)) {
					throw new TRPCError({ code: "CONFLICT" });
				}

				throw error;
			}
		}),
	addFaceitAccount: protectedProcedure
		.input(
			z.object({
				externalId: z.string().min(1, "Faceit ID is required"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await db.transaction(async (tx) => {
					const [gameAccount] = await tx
						.insert(gameAccounts)
						.values({
							id: crypto.randomUUID(),
							userId: ctx.session.user.id,
							gameId: GAMES.CS2_FACEIT,
							externalId: input.externalId,
							lastSyncedAt: new Date(),
						})
						.returning();

					if (!gameAccount) {
						throw new Error("Failed to create Faceit game account");
					}

					const [cs2FaceitProfile] = await tx
						.insert(cs2FaceitGameAccountProfiles)
						.values({
							gameAccountId: gameAccount.id,
							gameId: GAMES.CS2_FACEIT,
							faceitNickname: input.externalId,
						})
						.returning();

					return mapGameAccountRecord({
						...gameAccount,
						lolProfile: null,
						cs2FaceitProfile: cs2FaceitProfile ?? null,
					});
				});
			} catch (error) {
				if (isGameAccountUniqueViolation(error)) {
					throw new TRPCError({ code: "CONFLICT" });
				}

				throw error;
			}
		}),
});
