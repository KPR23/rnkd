import { and, eq } from "drizzle-orm";

import { db, gameAccounts, GAMES, playerStats } from "@repo/db";
import type { ParsedFaceitLifetimeStats } from "@repo/types";

import {
  getFaceitPlayerById,
  getFaceitPlayerStats,
} from "./faceit-client";
import { parseFaceitLifetimeStats } from "./faceit-lifetime-stats";
import { resolveCs2FaceitElo } from "./faceit-player";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function persistFaceitLifetimeStatsInTx(
  tx: DbTx,
  params: {
    gameAccountId: string;
    lifetime: ParsedFaceitLifetimeStats;
    currentElo: number | null;
    syncedAt: Date;
  },
) {
  const { gameAccountId, lifetime, currentElo, syncedAt } = params;
  const winRate =
    lifetime.winRate ??
    (lifetime.totalMatches > 0
      ? (lifetime.totalWins / lifetime.totalMatches) * 100
      : 0);

  const sharedStats = {
    totalMatches: lifetime.totalMatches,
    totalWins: lifetime.totalWins,
    winRate,
    avgKd: lifetime.avgKd,
    lastCalculatedAt: syncedAt,
  };

  await tx
    .insert(playerStats)
    .values({
      gameAccountId,
      ...sharedStats,
      currentElo: currentElo ?? 0,
      avg_kills: 0,
      avg_deaths: 0,
      avg_assists: 0,
    })
    .onConflictDoUpdate({
      target: playerStats.gameAccountId,
      set: {
        ...sharedStats,
        ...(currentElo !== null ? { currentElo } : {}),
      },
    });
}

export async function syncFaceitLifetimeStats(
  gameAccountId: string,
): Promise<boolean> {
  const account = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.id, gameAccountId),
      eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
    ),
  });

  if (!account?.externalId) {
    return false;
  }

  const [statsResponse, player] = await Promise.all([
    getFaceitPlayerStats(account.externalId),
    getFaceitPlayerById(account.externalId),
  ]);

  const lifetime = parseFaceitLifetimeStats(statsResponse?.lifetime);
  if (!lifetime) {
    return false;
  }

  const syncedAt = new Date();
  const currentElo = resolveCs2FaceitElo(player);

  await db.transaction(async (tx) => {
    await persistFaceitLifetimeStatsInTx(tx, {
      gameAccountId,
      lifetime,
      currentElo,
      syncedAt,
    });
  });

  return true;
}
