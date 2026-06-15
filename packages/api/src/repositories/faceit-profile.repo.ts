import { and, count, desc, eq, max } from "drizzle-orm";

import {
  cs2FaceitMatchPlayers,
  db,
  eloHistory,
  GAMES,
  matches,
  playerStats,
} from "@repo/db";
import type { FaceitMatchKdRow, FaceitMatchPerformanceRow } from "@repo/types";

function faceitAccountMatchFilter(gameAccountId: string) {
  return and(
    eq(cs2FaceitMatchPlayers.gameAccountId, gameAccountId),
    eq(matches.gameId, GAMES.CS2_FACEIT),
  );
}

export async function findRecentFaceitMatchPerformance(
  gameAccountId: string,
  limit: number,
): Promise<FaceitMatchPerformanceRow[]> {
  return db
    .select({
      kills: cs2FaceitMatchPlayers.kills,
      deaths: cs2FaceitMatchPlayers.deaths,
      adr: cs2FaceitMatchPlayers.adr,
      headshotPct: cs2FaceitMatchPlayers.headshotPct,
      win: cs2FaceitMatchPlayers.win,
    })
    .from(cs2FaceitMatchPlayers)
    .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
    .where(faceitAccountMatchFilter(gameAccountId))
    .orderBy(desc(matches.playedAt))
    .limit(limit);
}

export async function countFaceitMatches(
  gameAccountId: string,
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(cs2FaceitMatchPlayers)
    .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
    .where(faceitAccountMatchFilter(gameAccountId));

  return row?.total ?? 0;
}

export async function countFaceitWins(gameAccountId: string): Promise<number> {
  const [row] = await db
    .select({ wins: count() })
    .from(cs2FaceitMatchPlayers)
    .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
    .where(
      and(
        faceitAccountMatchFilter(gameAccountId),
        eq(cs2FaceitMatchPlayers.win, true),
      ),
    );

  return row?.wins ?? 0;
}

export async function findFaceitMatchKdRows(
  gameAccountId: string,
): Promise<FaceitMatchKdRow[]> {
  return db
    .select({
      kills: cs2FaceitMatchPlayers.kills,
      deaths: cs2FaceitMatchPlayers.deaths,
    })
    .from(cs2FaceitMatchPlayers)
    .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
    .where(faceitAccountMatchFilter(gameAccountId));
}

export async function findFaceitEloPeak(
  gameAccountId: string,
): Promise<number | null> {
  const [row] = await db
    .select({ peak: max(eloHistory.elo) })
    .from(eloHistory)
    .where(eq(eloHistory.gameAccountId, gameAccountId));

  return row?.peak ?? null;
}

export async function findFaceitPlayerStats(gameAccountId: string) {
  try {
    return await db.query.playerStats.findFirst({
      where: eq(playerStats.gameAccountId, gameAccountId),
    });
  } catch (error) {
    console.error("findFaceitPlayerStats failed", { gameAccountId, error });
    return null;
  }
}
