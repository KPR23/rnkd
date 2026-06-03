import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";

import { db, GAMES, matches, matchParticipants } from "@repo/db";
import { isLolGameAccount } from "@repo/types";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import { findLolRankedEntries } from "../../repositories/ranked.repo";
import { average } from "../../lib/average";
import { mapGameAccountRecord } from "../game-account/normalize";

export const RANKED_SOLO = "RANKED_SOLO_5x5";
export const RANKED_FLEX = "RANKED_FLEX_SR";

export function pickPrimaryLolRankedEntry<T extends { queueType: string }>(
  rows: T[],
): T | null {
  if (rows.length === 0) {
    return null;
  }

  return (
    rows.find((row) => row.queueType === RANKED_SOLO) ??
    rows.find((row) => row.queueType === RANKED_FLEX) ??
    rows[0] ??
    null
  );
}

export async function getLolProfileDisplay(gameAccountId: string) {
  const accountRecord = await findGameAccountById(gameAccountId);

  if (!accountRecord) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const account = mapGameAccountRecord(accountRecord);

  if (!isLolGameAccount(account)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Not a League of Legends account",
    });
  }

  const rankedRows = await findLolRankedEntries(gameAccountId);

  const perfRows = await db
    .select({
      kills: matchParticipants.kills,
      deaths: matchParticipants.deaths,
      assists: matchParticipants.assists,
      totalMinionsKilled: matchParticipants.totalMinionsKilled,
      team: matchParticipants.team,
      team1Score: matches.team1Score,
      team2Score: matches.team2Score,
      durationSeconds: matches.durationSeconds,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .where(
      and(
        eq(matchParticipants.gameAccountId, gameAccountId),
        eq(matches.gameId, GAMES.LOL),
      ),
    )
    .orderBy(desc(matches.playedAt))
    .limit(20);

  const primaryRanked = pickPrimaryLolRankedEntry(rankedRows);
  const rankedSoloDuo =
    rankedRows.find((row) => row.queueType === RANKED_SOLO) ?? null;
  const rankedFlex =
    rankedRows.find((row) => row.queueType === RANKED_FLEX) ?? null;

  let rankedWinRate = 0;
  if (primaryRanked) {
    const played = primaryRanked.wins + primaryRanked.losses;
    rankedWinRate = played > 0 ? (primaryRanked.wins / played) * 100 : 0;
  }

  const kdaValues: number[] = [];
  const csPerMinValues: number[] = [];
  const kpValues: number[] = [];

  for (const row of perfRows) {
    kdaValues.push((row.kills + row.assists) / Math.max(1, row.deaths));

    const durationMinutes =
      row.durationSeconds && row.durationSeconds > 0
        ? row.durationSeconds / 60
        : null;
    if (
      durationMinutes &&
      row.totalMinionsKilled !== null &&
      row.totalMinionsKilled !== undefined
    ) {
      csPerMinValues.push(row.totalMinionsKilled / durationMinutes);
    }

    const teamKills = row.team === 100 ? row.team1Score : row.team2Score;
    if (teamKills > 0) {
      kpValues.push(((row.kills + row.assists) / teamKills) * 100);
    }
  }

  return {
    gameAccount: account,
    ranked: primaryRanked,
    rankedSoloDuo,
    rankedFlex,
    rankedWinRate,
    recentPerformance: {
      avgKda: average(kdaValues),
      avgCsPerMin: average(csPerMinValues),
      kpPercent: average(kpValues),
    },
  };
}
