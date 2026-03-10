import { db, gameAccounts, GAMES, matches, matchParticipants } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";

export const riotRouter = router({
	getMatchHistory: protectedProcedure.query(async ({ ctx }) => {
		const [gameAccount] = await db
			.select()
			.from(gameAccounts)
			.where(
				and(
					eq(gameAccounts.userId, ctx.session.user.id),
					eq(gameAccounts.gameId, GAMES.LOL),
				),
			);
		if (!gameAccount) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}
		const matchHistory = await db
			.select()
			.from(matches)
			.innerJoin(matchParticipants, eq(matches.id, matchParticipants.matchId))
			.where(
				and(
					eq(matches.gameId, GAMES.LOL),
					eq(matchParticipants.gameAccountId, gameAccount.id),
				),
			);
		return matchHistory;
	}),
});
