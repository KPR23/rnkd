import { db, gameAccounts } from "@repo/db";
import z from "zod";
import { protectedProcedure, router } from "../trpc";

export const gameAccountRouter = router({
	addGameAccount: protectedProcedure
		.input(
			z.object({
				gameId: z.string(),
				externalId: z.string(),
				nickname: z.string(),
				region: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const gameAccountRecord = await db
				.insert(gameAccounts)
				.values({
					id: crypto.randomUUID(),
					gameId: input.gameId,
					externalId: input.externalId,
					nickname: input.nickname,
					region: input.region,
					userId: ctx.session.user.id,
				})
				.returning();

			return gameAccountRecord;
		}),
});
