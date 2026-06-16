import z from "zod";

import { matchHistoryInputSchema } from "../schemas/common";
import { getCs2FaceitMatchDetails } from "../services/match/cs2-faceit-details";
import { getMatchHistoryForAccount } from "../services/match/history";
import { getLolMatchDetails } from "../services/match/lol-details";
import { requireGameAccountAccess } from "../trpc/middleware/require-game-account-access";
import { protectedProcedure, router } from "../trpc";

export const matchRouter = router({
  getHistory: protectedProcedure
    .input(matchHistoryInputSchema)
    .use(requireGameAccountAccess("public-read"))
    .query(({ input }) =>
      getMatchHistoryForAccount({
        gameAccountId: input.gameAccountId,
        limit: input.limit,
        cursor: input.cursor,
      }),
    ),
  getHistoryPage: protectedProcedure
    .input(matchHistoryInputSchema)
    .use(requireGameAccountAccess("public-read"))
    .query(async ({ input }) => {
      const { getMatchHistoryPageForAccount } = await import(
        "../services/match/history"
      );

      return getMatchHistoryPageForAccount({
        gameAccountId: input.gameAccountId,
        limit: input.limit,
        cursor: input.cursor,
      });
    }),
  getCs2FaceitMatchDetails: protectedProcedure
    .input(
      z.object({
        matchId: z.string().min(1),
        gameAccountId: z.uuid(),
      }),
    )
    .use(requireGameAccountAccess("public-read"))
    .query(({ input }) => getCs2FaceitMatchDetails(input)),
  getLolMatchDetails: protectedProcedure
    .input(
      z.object({
        matchId: z.string().min(1),
        gameAccountId: z.uuid(),
      }),
    )
    .use(requireGameAccountAccess("public-read"))
    .query(({ input }) => getLolMatchDetails(input)),
});
