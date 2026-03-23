import {
	db,
	gameAccounts,
	GAMES,
	lolRankedEntries,
	RIOT_REGIONAL_ROUTE,
	RiotPlatformRoute,
	RiotRegionalRoute,
} from "@repo/db";
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

function refreshLolAccountDataInBackground(
	accountId: string,
	externalId: string,
	platformRoute: RiotPlatformRoute,
) {
	void Promise.allSettled([
		getLolAccountDetails(externalId, platformRoute).then(async (details) => {
			await db
				.update(gameAccounts)
				.set({
					profileIconId: details.profileIconId,
					summonerLevel: details.summonerLevel,
					lastSyncedAt: new Date(),
				})
				.where(eq(gameAccounts.id, accountId));
		}),
		getLolLeagueEntriesByPuuid(externalId, platformRoute).then(
			async (entries) => {
				await db
					.delete(lolRankedEntries)
					.where(eq(lolRankedEntries.gameAccountId, accountId));
				if (entries.length === 0) {
					return;
				}
				const syncedAt = new Date();
				await db.insert(lolRankedEntries).values(
					entries.map((e) => ({
						gameAccountId: accountId,
						queueType: e.queueType,
						tier: e.tier,
						rank: e.rank || null,
						leaguePoints: e.leaguePoints,
						wins: e.wins,
						losses: e.losses,
						hotStreak: e.hotStreak,
						inactive: e.inactive,
						syncedAt,
					})),
				);
			},
		),
	]).then((results) => {
		for (const r of results) {
			if (r.status === "rejected") {
				console.error(r.reason);
			}
		}
	});
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
		rows.find((r) => r.queueType === RANKED_SOLO) ??
		rows.find((r) => r.queueType === RANKED_FLEX) ??
		rows[0] ??
		null
	);
}

export const gameAccountRouter = router({
	getGameAccounts: protectedProcedure.query(async ({ ctx }) => {
		const accounts = await db.query.gameAccounts.findMany({
			where: eq(gameAccounts.userId, ctx.session.user.id),
		});

		const lolAccounts = accounts.filter(
			(a) => a.gameId === GAMES.LOL && a.regionalRoute && a.platformRoute,
		);

		const faceitAccounts = accounts.filter(
			(a) => a.gameId === GAMES.CS2_FACEIT,
		);

		for (const a of lolAccounts) {
			const shouldRefresh =
				!a.lastSyncedAt ||
				Date.now() - a.lastSyncedAt.getTime() > LOL_PROFILE_REFRESH_TTL_MS;
			if (!shouldRefresh) continue;

			refreshLolAccountDataInBackground(
				a.id,
				a.externalId,
				a.platformRoute as RiotPlatformRoute,
			);
		}

		return {
			lol: lolAccounts,
			faceit: faceitAccounts,
		};
	}),
	getLolProfileDisplay: protectedProcedure
		.input(z.object({ gameAccountId: z.uuid() }))
		.query(async ({ ctx, input }) => {
			const account = await db.query.gameAccounts.findFirst({
				where: eq(gameAccounts.id, input.gameAccountId),
			});

			if (!account || account.userId !== ctx.session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (account.gameId !== GAMES.LOL) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Not a League of Legends account",
				});
			}

			const rankedRows = await db.query.lolRankedEntries.findMany({
				where: eq(lolRankedEntries.gameAccountId, input.gameAccountId),
			});

			const primaryRanked = pickPrimaryLolRankedEntry(rankedRows);

			let rankedWinRate = 0;
			if (primaryRanked) {
				const played = primaryRanked.wins + primaryRanked.losses;
				rankedWinRate = played > 0 ? (primaryRanked.wins / played) * 100 : 0;
			}

			return {
				gameAccount: account,
				ranked: primaryRanked,
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
				const gameAccountRecord = await db
					.insert(gameAccounts)
					.values({
						id: crypto.randomUUID(),
						userId: ctx.session.user.id,
						gameId: GAMES.LOL,
						externalId: riotAccount.puuid,
						gameName: riotAccount.gameName,
						tagLine: riotAccount.tagLine,
						profileIconId: details.profileIconId,
						summonerLevel: details.summonerLevel,
						regionalRoute: input.region as RiotRegionalRoute,
						platformRoute: activeRegion as RiotPlatformRoute,
						lastSyncedAt: new Date(),
					})
					.returning();

				const [created] = gameAccountRecord;
				if (created) {
					try {
						const entries = await getLolLeagueEntriesByPuuid(
							created.externalId,
							created.platformRoute as RiotPlatformRoute,
						);
						if (entries.length > 0) {
							const syncedAt = new Date();
							await db.insert(lolRankedEntries).values(
								entries.map((e) => ({
									gameAccountId: created.id,
									queueType: e.queueType,
									tier: e.tier,
									rank: e.rank || null,
									leaguePoints: e.leaguePoints,
									wins: e.wins,
									losses: e.losses,
									hotStreak: e.hotStreak,
									inactive: e.inactive,
									syncedAt,
								})),
							);
						}
					} catch (rankedError) {
						console.error(rankedError);
					}
				}

				return gameAccountRecord;
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
				const gameAccountRecord = await db
					.insert(gameAccounts)
					.values({
						id: crypto.randomUUID(),
						gameId: GAMES.CS2_FACEIT,
						externalId: input.externalId,
						regionalRoute: null,
						platformRoute: null,
						userId: ctx.session.user.id,
					})
					.returning();

				return gameAccountRecord;
			} catch (error) {
				if (isGameAccountUniqueViolation(error)) {
					throw new TRPCError({ code: "CONFLICT" });
				}

				throw error;
			}
		}),
});
