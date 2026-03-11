import {
	db,
	gameAccounts,
	GAMES,
	matches,
	matchParticipants,
	RIOT_REGIONAL_ROUTE,
} from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";
import {
	getLolAccountDetails,
	getLolActiveRegionByPuuid,
} from "../services/riot/riot";
import z from "zod";

const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);

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
			)
			.orderBy(desc(matches.playedAt));

		return matchHistory;
	}),
	getLolAccountDetails: protectedProcedure
		.input(
			z.object({
				puuid: z.string(),
				region: riotRegionalRouteSchema,
			}),
		)
		.query(async ({ input }) => {
			const platform = await getLolActiveRegionByPuuid(
				input.puuid,
				input.region,
			);
			return getLolAccountDetails(input.puuid, platform);
		}),
});
