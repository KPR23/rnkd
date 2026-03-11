import { db, gameAccounts, GAMES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { syncLolForAccount } from "../services/riot/lol-sync-runner";
import {
	getAccountByRiotId,
	getLolAccountDetails,
	getLolActiveRegionByPuuid,
} from "../services/riot/riot";
import { protectedProcedure, router } from "../trpc";
import { RIOT_REGIONAL_ROUTE } from "../services/riot/types";

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

export const gameAccountRouter = router({
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

			const details = await getLolAccountDetails(
				riotAccount.puuid,
				activeRegion,
			);

			try {
				const gameAccountRecord = await db
					.insert(gameAccounts)
					.values({
						id: crypto.randomUUID(),
						gameId: GAMES.LOL,
						externalId: riotAccount.puuid,
						gameName: riotAccount.gameName,
						tagLine: riotAccount.tagLine,
						profileIconId: details.profileIconId,
						summonerLevel: details.summonerLevel,
						regionalRoute: input.region,
						platformRoute: activeRegion,
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
