import { db, games } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, router } from "../trpc";

export const gameRouter = router({
	getAllGames: protectedProcedure.query(async () => {
		return db.query.games.findMany();
	}),
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const game = await db.query.games.findFirst({
				where: eq(games.id, input.id),
			});

			if (!game) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return game;
		}),
});
