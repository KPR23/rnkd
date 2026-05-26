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

  const primaryAccountsByGame = new Map<string, (typeof accounts)[number]>();
  for (const account of accounts) {
    const existing = primaryAccountsByGame.get(account.gameId);
    if (!existing) {
      primaryAccountsByGame.set(account.gameId, account);
      continue;
    }

    const existingSyncedAt = existing.lastSyncedAt?.getTime() ?? 0;
    const currentSyncedAt = account.lastSyncedAt?.getTime() ?? 0;
    if (currentSyncedAt > existingSyncedAt) {
      primaryAccountsByGame.set(account.gameId, account);
    }
  }

  const faceitAccount = primaryAccountsByGame.get(GAMES.CS2_FACEIT);
  const lolAccount = primaryAccountsByGame.get(GAMES.LOL);

  let faceitElo: number | null = null;
  if (faceitAccount) {
    const ranked = await findCs2FaceitRankedEntries(faceitAccount.id);
    const primary =
      ranked.find((row) => row.gameKey === "cs2") ?? ranked[0] ?? null;
    if (primary?.faceitElo !== null && primary?.faceitElo !== undefined) {
      faceitElo = primary.faceitElo;
    }
  }

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

  if (lolAccount) {
    const ranked = await findLolRankedEntries(lolAccount.id);
    lolSolo =
      ranked.find((row) => row.queueType === RANKED_SOLO_QUEUE) ?? lolSolo;
    lolFlex =
      ranked.find((row) => row.queueType === RANKED_FLEX_QUEUE) ?? lolFlex;
  }

  const globalRs = computeGlobalRsFromScores({
    faceitElo,
    lolSolo,
    lolFlex,
  });

  await executor.update(user).set({ globalRs }).where(eq(user.id, userId));

  return globalRs;
}
