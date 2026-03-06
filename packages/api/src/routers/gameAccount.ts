import { db, gameAccounts, GAMES } from "@repo/db";
import z from "zod";
import { protectedProcedure, router } from "../trpc";
import { getAccountByRiotId, RIOT_REGIONS } from "../services/riot";

const riotRegionSchema = z.enum(RIOT_REGIONS);

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
				externalId: z.string().min(1, "Faceit ID is required"),
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
