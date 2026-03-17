import { db } from "@repo/db";
import { protectedProcedure, router } from "../trpc";

export const gameRouter = router({
	getAllGames: protectedProcedure.query(async ({ ctx }) => {
		return await db.query.games.findMany();
	}),
});
