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
  cursor?: {
    playedAt: Date;
    id: string;
  };
}) {
  const account = await findGameAccountByIdAndGameId(
    input.gameAccountId,
    GAMES.LOL,
  );

  if (account) {
    return {
      gameId: GAMES.LOL as typeof GAMES.LOL,
      rows: await listLolMatchHistory(
        input.gameAccountId,
        input.limit,
        input.cursor,
      ),
    };
  }

  const faceitAccount = await findGameAccountByIdAndGameId(
    input.gameAccountId,
    GAMES.CS2_FACEIT,
  );

  if (faceitAccount) {
    return {
      gameId: GAMES.CS2_FACEIT as typeof GAMES.CS2_FACEIT,
      rows: await listCs2FaceitMatchHistory(
        input.gameAccountId,
        input.limit,
        input.cursor,
      ),
    };
  }

  throw new TRPCError({ code: "NOT_FOUND" });
}

export async function getMatchHistoryPageForAccount(input: {
  gameAccountId: string;
  limit: number;
  cursor?: {
    playedAt: Date;
    id: string;
  };
}) {
  const pageSize = input.limit;
  const result = await getMatchHistoryForAccount({
    ...input,
    limit: pageSize + 1,
  });
  const rows = result.rows.slice(0, pageSize);
  const hasMore = result.rows.length > pageSize;
  const lastRow = rows.at(-1);

  return {
    ...result,
    rows,
    nextCursor:
      hasMore && lastRow
        ? {
            playedAt: lastRow.matches.playedAt,
            id: lastRow.matches.id,
          }
        : null,
  };
}
