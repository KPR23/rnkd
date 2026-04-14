import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { db, gameAccounts, GAMES, matches, matchParticipants } from "@repo/db";
import { RIOT_REGIONAL_ROUTE } from "@repo/types";

import {
  getLolAccountDetails,
  getLolActiveRegionByPuuid,
} from "../services/riot/riot";
import { protectedProcedure, router } from "../trpc";

const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);

export const riotRouter = router({
  getMatchHistory: protectedProcedure
    .input(
      z.object({
        gameAccountId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const [gameAccount] = await db
        .select()
        .from(gameAccounts)
        .where(
          and(
            eq(gameAccounts.id, input.gameAccountId),
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
