import z from "zod";

import {
  getFaceitPlayer,
  getFaceitSuggestedPlayers,
} from "../services/faceit/faceit-client";
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
  getSuggestedPlayers: protectedProcedure
    .input(
      z.object({
        playerId: z.string().min(1, "Player ID is required"),
        limit: z.number().int().min(1).max(5).default(3),
      }),
    )
    .query(async ({ input }) => {
      return await getFaceitSuggestedPlayers(input.playerId, input.limit);
    }),
});
