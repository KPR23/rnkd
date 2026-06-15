import type {
  FaceitAllTimeMetrics,
  FaceitMatchPerformanceRow,
  FaceitRecentPerformance,
  FaceitRecentRecord,
} from "@repo/types";

import { average } from "../../lib/average";

const RECENT_MATCH_LIMIT = 20;

export function computeKdRatio(
  kills: number | null,
  deaths: number | null,
): number | null {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined
  ) {
    return null;
  }

  return deaths > 0 ? kills / deaths : kills;
}

export function computeFaceitRecentPerformance(
  rows: FaceitMatchPerformanceRow[],
): FaceitRecentPerformance {
  const kdRatios: number[] = [];
  let hsSum = 0;
  let hsCount = 0;
  let adrSum = 0;
  let adrCount = 0;

  for (const row of rows) {
    const kd = computeKdRatio(row.kills, row.deaths);
    if (kd !== null) {
      kdRatios.push(kd);
    }

    if (
      typeof row.headshotPct === "number" &&
      Number.isFinite(row.headshotPct)
    ) {
      hsSum += row.headshotPct;
      hsCount += 1;
    }

    if (typeof row.adr === "number" && Number.isFinite(row.adr)) {
      adrSum += row.adr;
      adrCount += 1;
    }
  }

  return {
    avgKd: average(kdRatios),
    avgHsPct: hsCount > 0 ? hsSum / hsCount : null,
    avgAdr: adrCount > 0 ? adrSum / adrCount : null,
  };
}

export function computeFaceitRecentRecord(
  rows: FaceitMatchPerformanceRow[],
): FaceitRecentRecord | null {
  const recentPlayed = rows.length;
  if (recentPlayed === 0) {
    return null;
  }

  const recentWins = rows.filter((row) => row.win === true).length;
  const recentLosses = recentPlayed - recentWins;

  return {
    wins: recentWins,
    losses: recentLosses,
    played: recentPlayed,
    winRate: (recentWins / recentPlayed) * 100,
  };
}

export function mapPlayerStatsToAllTimeMetrics(
  row: {
    totalMatches: number;
    winRate: number;
    avgKd: number | null;
  },
  historyPeak: number | null,
): FaceitAllTimeMetrics {
  return {
    totalMatches: row.totalMatches,
    winRate: Number.isFinite(row.winRate) ? row.winRate : null,
    avgKd:
      row.avgKd !== null && row.avgKd !== undefined && Number.isFinite(row.avgKd)
        ? row.avgKd
        : null,
    eloPeak: resolveTrackedEloPeak(historyPeak),
  };
}

export function resolveTrackedEloPeak(historyPeak: number | null): number | null {
  if (historyPeak === null || historyPeak === undefined) {
    return null;
  }

  return historyPeak;
}

export { RECENT_MATCH_LIMIT };
