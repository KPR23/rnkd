import { TRPCError } from "@trpc/server";
import z from "zod";

import { GAMES } from "@repo/db";

import { gameAccountIdSchema } from "../schemas/common";
import { riotRegionalRouteSchema } from "../schemas/riot";
import { getMatchHistoryForAccount } from "../services/match/history";
import {
  getLolAccountDetails,
  getLolActiveRegionByPuuid,
} from "../services/riot/riot-client";
import { requireGameAccountAccess } from "../trpc/middleware/require-game-account-access";
import { protectedProcedure, router } from "../trpc";

export const riotRouter = router({
  getMatchHistory: protectedProcedure
    .input(
      gameAccountIdSchema.extend({
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .use(requireGameAccountAccess("public-read"))
    .query(async ({ input }) => {
      const result = await getMatchHistoryForAccount({
        gameAccountId: input.gameAccountId,
        limit: input.limit ?? 40,
      });

      if (result.gameId !== GAMES.LOL) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a League of Legends account",
        });
      }

      return result.rows;
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
