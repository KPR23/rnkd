import { TRPCError } from "@trpc/server";

import { GAMES } from "@repo/db";

import { findGameAccountByIdAndGameId } from "../../repositories/game-accounts.repo";
import {
  listCs2FaceitMatchHistory,
  listLolMatchHistory,
} from "../../repositories/match-history.repo";

export async function getMatchHistoryForAccount(input: {
  gameAccountId: string;
  limit: number;
}) {
  const account = await findGameAccountByIdAndGameId(
    input.gameAccountId,
    GAMES.LOL,
  );

  if (account) {
    return {
      gameId: GAMES.LOL as typeof GAMES.LOL,
      rows: await listLolMatchHistory(input.gameAccountId, input.limit),
    };
  }

  const faceitAccount = await findGameAccountByIdAndGameId(
    input.gameAccountId,
    GAMES.CS2_FACEIT,
  );

  if (faceitAccount) {
    return {
      gameId: GAMES.CS2_FACEIT as typeof GAMES.CS2_FACEIT,
      rows: await listCs2FaceitMatchHistory(input.gameAccountId, input.limit),
    };
  }

  throw new TRPCError({ code: "NOT_FOUND" });
}
