import z from "zod";

import { getFaceitPlayer } from "../services/faceit/faceit-client";
import { protectedProcedure, router } from "../trpc";

export const faceitRouter = router({
  getFaceitPlayer: protectedProcedure
    .input(
      z.object({
        nickname: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const player = await getFaceitPlayer(input.nickname);
      return player;
    }),
});
