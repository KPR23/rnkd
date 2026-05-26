import { eq } from "drizzle-orm";

import { db, GAMES, user } from "@repo/db";

import { findGameAccountsByUserId } from "../../repositories/game-accounts.repo";
import type { DbExecutor } from "../../repositories/db-executor";
import {
  findCs2FaceitRankedEntries,
  findLolRankedEntries,
} from "../../repositories/ranked.repo";
import {
  computeGlobalRsFromScores,
  RANKED_FLEX_QUEUE,
  RANKED_SOLO_QUEUE,
} from "./rnkd-score-calculations";

export {
  computeGlobalRsFromScores,
  faceitEloToPoints,
  lolRankToFlexPoints,
  lolRankToSoloPoints,
  RANKED_FLEX_QUEUE,
  RANKED_SOLO_QUEUE,
} from "./rnkd-score-calculations";

export async function recomputeGlobalRs(
  userId: string,
  executor: DbExecutor = db,
): Promise<number> {
  const accounts = await findGameAccountsByUserId(userId, executor);

  let faceitElo: number | null = null;
  let lolSolo: {
    tier: string;
    rank: string | null;
    leaguePoints: number;
  } | null = null;
  let lolFlex: {
    tier: string;
    rank: string | null;
    leaguePoints: number;
  } | null = null;

  for (const account of accounts) {
    if (account.gameId === GAMES.CS2_FACEIT) {
      const ranked = await findCs2FaceitRankedEntries(account.id);
      const primary =
        ranked.find((row) => row.gameKey === "cs2") ?? ranked[0] ?? null;
      if (primary?.faceitElo !== null && primary?.faceitElo !== undefined) {
        faceitElo = primary.faceitElo;
      }
    }

    if (account.gameId === GAMES.LOL) {
      const ranked = await findLolRankedEntries(account.id);
      lolSolo =
        ranked.find((row) => row.queueType === RANKED_SOLO_QUEUE) ?? lolSolo;
      lolFlex =
        ranked.find((row) => row.queueType === RANKED_FLEX_QUEUE) ?? lolFlex;
    }
  }

  const globalRs = computeGlobalRsFromScores({
    faceitElo,
    lolSolo,
    lolFlex,
  });

  await executor.update(user).set({ globalRs }).where(eq(user.id, userId));

  return globalRs;
}
