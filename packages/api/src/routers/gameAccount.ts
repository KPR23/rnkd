import { db, gameAccounts, GAMES } from "@repo/db";
import z from "zod";
import { protectedProcedure, router } from "../trpc";
import { getAccountByRiotId } from "../services/riot";

export const gameAccountRouter = router({
	addLolAccount: protectedProcedure
		.input(
			z.object({
				gameName: z.string(),
				tagLine: z.string(),
				region: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const puuid = await getAccountByRiotId(input.gameName, input.tagLine);
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
		}),

	addFaceitAccount: protectedProcedure
		.input(
			z.object({
				externalId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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
		}),
});
