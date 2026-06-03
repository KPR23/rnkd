import { matchHistoryInputSchema } from "../schemas/common";
import { getMatchHistoryForAccount } from "../services/match/history";
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
      }),
    ),
});
