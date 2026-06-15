import { and, desc, eq, gte, inArray, lt, max, or, sql } from "drizzle-orm";

import {
  cs2FaceitMatchPlayers,
  db,
  gameAccounts,
  GAMES,
  matches,
  matchParticipants,
} from "@repo/db";
import type { Cs2FaceitMatchHistoryRow } from "@repo/types";

export type MatchHistoryCursor = {
  playedAt: Date;
  id: string;
};

function buildMatchHistoryCursorFilter(cursor: MatchHistoryCursor | undefined) {
  if (!cursor) {
    return undefined;
  }

  return or(
    lt(matches.playedAt, cursor.playedAt),
    and(eq(matches.playedAt, cursor.playedAt), lt(matches.id, cursor.id)),
  );
}

export async function listLolMatchHistory(
  gameAccountId: string,
  limit: number,
  cursor?: MatchHistoryCursor,
) {
  return db
    .select()
    .from(matches)
    .innerJoin(matchParticipants, eq(matches.id, matchParticipants.matchId))
    .where(
      and(
        eq(matches.gameId, GAMES.LOL),
        eq(matchParticipants.gameAccountId, gameAccountId),
        buildMatchHistoryCursorFilter(cursor),
      ),
    )
    .orderBy(desc(matches.playedAt), desc(matches.id))
    .limit(limit);
}

export async function listCs2FaceitMatchHistory(
  gameAccountId: string,
  limit: number,
  cursor?: MatchHistoryCursor,
): Promise<Cs2FaceitMatchHistoryRow[]> {
  const rows = await db
    .select({
      matches,
      cs2_faceit_match_players: cs2FaceitMatchPlayers,
    })
    .from(matches)
    .innerJoin(
      cs2FaceitMatchPlayers,
      eq(matches.id, cs2FaceitMatchPlayers.matchId),
    )
    .where(
      and(
        eq(matches.gameId, GAMES.CS2_FACEIT),
        eq(cs2FaceitMatchPlayers.gameAccountId, gameAccountId),
        buildMatchHistoryCursorFilter(cursor),
      ),
    )
    .orderBy(desc(matches.playedAt), desc(matches.id))
    .limit(limit);

  return rows;
}

export async function getLastActiveAtForUser(userId: string): Promise<Date | null> {
  const accounts = await db
    .select({ id: gameAccounts.id })
    .from(gameAccounts)
    .where(eq(gameAccounts.userId, userId));

  if (accounts.length === 0) {
    return null;
  }

  const accountIds = accounts.map((account) => account.id);

  const [lolMax] = await db
    .select({ value: max(matches.playedAt) })
    .from(matches)
    .innerJoin(matchParticipants, eq(matches.id, matchParticipants.matchId))
    .where(inArray(matchParticipants.gameAccountId, accountIds));

  const [faceitMax] = await db
    .select({ value: max(matches.playedAt) })
    .from(matches)
    .innerJoin(
      cs2FaceitMatchPlayers,
      eq(matches.id, cs2FaceitMatchPlayers.matchId),
    )
    .where(inArray(cs2FaceitMatchPlayers.gameAccountId, accountIds));

  const timestamps = [lolMax?.value, faceitMax?.value].filter(
    (value): value is Date => value instanceof Date,
  );

  if (timestamps.length === 0) {
    return null;
  }

  return timestamps.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

export async function getMatchActivityDatesForUser(
  userId: string,
  days: number,
): Promise<string[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const accounts = await db
    .select({ id: gameAccounts.id })
    .from(gameAccounts)
    .where(eq(gameAccounts.userId, userId));

  if (accounts.length === 0) {
    return [];
  }

  const accountIds = accounts.map((account) => account.id);

  const lolDates = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${matches.playedAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
    })
    .from(matches)
    .innerJoin(matchParticipants, eq(matches.id, matchParticipants.matchId))
    .where(
      and(
        inArray(matchParticipants.gameAccountId, accountIds),
        gte(matches.playedAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${matches.playedAt} at time zone 'UTC')`);

  const faceitDates = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${matches.playedAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
    })
    .from(matches)
    .innerJoin(
      cs2FaceitMatchPlayers,
      eq(matches.id, cs2FaceitMatchPlayers.matchId),
    )
    .where(
      and(
        inArray(cs2FaceitMatchPlayers.gameAccountId, accountIds),
        gte(matches.playedAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${matches.playedAt} at time zone 'UTC')`);

  const uniqueDays = new Set<string>();
  for (const row of [...lolDates, ...faceitDates]) {
    uniqueDays.add(row.day);
  }

  return [...uniqueDays];
}

export function buildMatchActivityGrid(
  activeDays: string[],
  days: number,
): { date: string; played: boolean }[] {
  const activeSet = new Set(activeDays);
  const grid: { date: string; played: boolean }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    grid.push({ date: key, played: activeSet.has(key) });
  }

  return grid;
}
