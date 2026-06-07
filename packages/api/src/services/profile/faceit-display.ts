import { TRPCError } from "@trpc/server";

import { getFaceitLevelProgress } from "@repo/types";
import { isCs2FaceitGameAccount } from "@repo/types";
import type { FaceitAllTimeMetrics } from "@repo/types";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import {
  findFaceitEloPeak,
  findFaceitPlayerStats,
  findRecentFaceitMatchPerformance,
} from "../../repositories/faceit-profile.repo";
import { findCs2FaceitRankedEntries } from "../../repositories/ranked.repo";
import { mapGameAccountRecord } from "../game-account/normalize";
import {
  computeFaceitRecentPerformance,
  computeFaceitRecentRecord,
  mapPlayerStatsToAllTimeMetrics,
  RECENT_MATCH_LIMIT,
  resolveTrackedEloPeak,
} from "./faceit-metrics";

function emptyAllTimeMetrics(historyPeak: number | null): FaceitAllTimeMetrics {
  return {
    totalMatches: 0,
    winRate: null,
    avgKd: null,
    eloPeak: resolveTrackedEloPeak(historyPeak),
  };
}

async function resolveAllTimeMetrics(
  gameAccountId: string,
  historyPeak: number | null,
): Promise<FaceitAllTimeMetrics> {
  const cached = await findFaceitPlayerStats(gameAccountId);

  if (!cached) {
    return emptyAllTimeMetrics(historyPeak);
  }

  return mapPlayerStatsToAllTimeMetrics(cached, historyPeak);
}

export async function getCs2FaceitProfileDisplay(gameAccountId: string) {
  const accountRecord = await findGameAccountById(gameAccountId);

  if (!accountRecord) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const account = mapGameAccountRecord(accountRecord);

  if (!isCs2FaceitGameAccount(account)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Not a CS2 (FACEIT) account",
    });
  }

  const [rankedRows, recentRows, historyPeak] = await Promise.all([
    findCs2FaceitRankedEntries(gameAccountId),
    findRecentFaceitMatchPerformance(gameAccountId, RECENT_MATCH_LIMIT),
    findFaceitEloPeak(gameAccountId),
  ]);

  const primaryRanked =
    rankedRows.find((row) => row.gameKey === "cs2") ?? rankedRows[0] ?? null;

  const faceitElo = primaryRanked?.faceitElo ?? null;
  const levelProgress =
    faceitElo !== null && faceitElo !== undefined
      ? getFaceitLevelProgress(faceitElo)
      : null;

  const allTimeMetrics = await resolveAllTimeMetrics(
    gameAccountId,
    historyPeak,
  );

  return {
    gameAccount: account,
    primaryRanked,
    levelProgress,
    allTimeMetrics,
    recentRecord: computeFaceitRecentRecord(recentRows),
    recentPerformance: computeFaceitRecentPerformance(recentRows),
  };
}
