import { eq, inArray } from "drizzle-orm";

import {
  db,
  gameAccountRsPoints,
  GAMES,
  RS_POINT_SOURCES,
  user,
  type RsPointSourceKey,
} from "@repo/db";

import type { DbExecutor } from "../../repositories/db-executor";
import { findGameAccountsByUserId } from "../../repositories/game-accounts.repo";
import {
  findCs2FaceitRankedEntries,
  findLolRankedEntries,
} from "../../repositories/ranked.repo";
import {
  faceitEloToPoints,
  lolRankToFlexPoints,
  lolRankToSoloPoints,
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

export type RsPointEntry = {
  gameAccountId: string;
  sourceKey: RsPointSourceKey;
  gameId: string;
  points: number;
};

export type RsBreakdown = {
  entries: RsPointEntry[];
  total: number;
};

function pickPrimaryAccountsByGame(
  accounts: Awaited<ReturnType<typeof findGameAccountsByUserId>>,
) {
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

  return primaryAccountsByGame;
}

export async function computeRsBreakdownForUser(
  userId: string,
): Promise<RsBreakdown> {
  const accounts = await findGameAccountsByUserId(userId);
  const primaryAccountsByGame = pickPrimaryAccountsByGame(accounts);

  const faceitAccount = primaryAccountsByGame.get(GAMES.CS2_FACEIT);
  const lolAccount = primaryAccountsByGame.get(GAMES.LOL);
  const entries: RsPointEntry[] = [];

  if (faceitAccount) {
    const ranked = await findCs2FaceitRankedEntries(faceitAccount.id);
    const primary =
      ranked.find((row) => row.gameKey === "cs2") ?? ranked[0] ?? null;

    entries.push({
      gameAccountId: faceitAccount.id,
      sourceKey: RS_POINT_SOURCES.CS2_FACEIT_ELO,
      gameId: GAMES.CS2_FACEIT,
      points: faceitEloToPoints(primary?.faceitElo),
    });
  }

  if (lolAccount) {
    const ranked = await findLolRankedEntries(lolAccount.id);
    const solo =
      ranked.find((row) => row.queueType === RANKED_SOLO_QUEUE) ?? null;
    const flex =
      ranked.find((row) => row.queueType === RANKED_FLEX_QUEUE) ?? null;

    entries.push({
      gameAccountId: lolAccount.id,
      sourceKey: RS_POINT_SOURCES.LOL_RANKED_SOLO,
      gameId: GAMES.LOL,
      points: solo
        ? lolRankToSoloPoints(solo.tier, solo.rank, solo.leaguePoints)
        : 0,
    });

    entries.push({
      gameAccountId: lolAccount.id,
      sourceKey: RS_POINT_SOURCES.LOL_RANKED_FLEX,
      gameId: GAMES.LOL,
      points: flex
        ? lolRankToFlexPoints(flex.tier, flex.rank, flex.leaguePoints)
        : 0,
    });
  }

  const total = entries.reduce((sum, entry) => sum + entry.points, 0);

  return { entries, total };
}

async function persistRsBreakdown(
  executor: DbExecutor,
  userId: string,
  breakdown: RsBreakdown,
  allAccountIds: string[],
) {
  const primaryAccountIds = new Set(
    breakdown.entries.map((entry) => entry.gameAccountId),
  );
  const staleAccountIds = allAccountIds.filter(
    (accountId) => !primaryAccountIds.has(accountId),
  );

  if (staleAccountIds.length > 0) {
    await executor
      .delete(gameAccountRsPoints)
      .where(inArray(gameAccountRsPoints.gameAccountId, staleAccountIds));
  }

  const computedAt = new Date();

  for (const entry of breakdown.entries) {
    await executor
      .insert(gameAccountRsPoints)
      .values({
        gameAccountId: entry.gameAccountId,
        sourceKey: entry.sourceKey,
        gameId: entry.gameId,
        points: entry.points,
        computedAt,
      })
      .onConflictDoUpdate({
        target: [
          gameAccountRsPoints.gameAccountId,
          gameAccountRsPoints.sourceKey,
        ],
        set: {
          gameId: entry.gameId,
          points: entry.points,
          computedAt,
        },
      });
  }

  await executor
    .update(user)
    .set({ globalRs: breakdown.total })
    .where(eq(user.id, userId));
}

export async function recomputeGlobalRs(
  userId: string,
  executor: DbExecutor = db,
): Promise<number> {
  const accounts = await findGameAccountsByUserId(userId, executor);
  const breakdown = await computeRsBreakdownForUser(userId);

  const runPersist = async (tx: DbExecutor) => {
    await persistRsBreakdown(
      tx,
      userId,
      breakdown,
      accounts.map((account) => account.id),
    );
  };

  if (executor === db) {
    await db.transaction(runPersist);
  } else {
    await runPersist(executor);
  }

  return breakdown.total;
}
