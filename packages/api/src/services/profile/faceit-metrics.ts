import type {
  FaceitAllTimeMetrics,
  FaceitMatchKdRow,
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

export function computeFaceitAllTimeMetrics(input: {
  totalMatches: number;
  wins: number;
  kdRows: FaceitMatchKdRow[];
  currentElo: number | null;
  historyPeak: number | null;
}): FaceitAllTimeMetrics {
  const { totalMatches, wins, kdRows, currentElo, historyPeak } = input;

  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : null;

  const kdRatios = kdRows
    .map((row) => computeKdRatio(row.kills, row.deaths))
    .filter((value): value is number => value !== null);

  const eloPeak = resolveFaceitEloPeak(currentElo, historyPeak);

  return {
    totalMatches,
    winRate,
    avgKd: average(kdRatios),
    eloPeak,
  };
}

export function resolveFaceitEloPeak(
  currentElo: number | null,
  historyPeak: number | null,
): number | null {
  if (currentElo !== null && currentElo !== undefined) {
    return historyPeak !== null && historyPeak !== undefined
      ? Math.max(currentElo, historyPeak)
      : currentElo;
  }

  if (historyPeak !== null && historyPeak !== undefined) {
    return historyPeak;
  }

  return null;
}

export { RECENT_MATCH_LIMIT };
