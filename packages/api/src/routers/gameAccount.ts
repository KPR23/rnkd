import { db, gameAccounts, GAMES } from "@repo/db";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "../trpc";
import { getAccountByRiotId, RIOT_REGIONS } from "../services/riot";

const riotRegionSchema = z.enum(RIOT_REGIONS);

const isGameAccountUniqueViolation = (error: unknown) => {
	if (!error || typeof error !== "object") return false;

	const err = error as { code?: string; constraint?: string };

	if (err.constraint === "game_accounts_game_external_unique") return true;
	if (err.code === "23505") return true;

	return false;
};

export const gameAccountRouter = router({
	addLolAccount: protectedProcedure
		.input(
			z.object({
				gameName: z.string().min(3, "Game name min. 3 characters").max(16),
				tagLine: z.string().min(3, "Tag line min. 3 characters").max(5),
				region: riotRegionSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const puuid = await getAccountByRiotId(
				input.gameName,
				input.tagLine,
				input.region,
			);

			try {
				const gameAccountRecord = await db
					.insert(gameAccounts)
					.values({
						id: crypto.randomUUID(),
						gameId: GAMES.LOL,
						externalId: puuid,
						region: input.region,
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
						region: null,
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
