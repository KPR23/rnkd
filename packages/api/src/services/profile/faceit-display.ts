import { TRPCError } from "@trpc/server";

import { getFaceitLevelProgress } from "@repo/types";
import { isCs2FaceitGameAccount } from "@repo/types";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import {
  countFaceitMatches,
  countFaceitWins,
  findFaceitEloPeak,
  findFaceitMatchKdRows,
  findRecentFaceitMatchPerformance,
} from "../../repositories/faceit-profile.repo";
import { findCs2FaceitRankedEntries } from "../../repositories/ranked.repo";
import { mapGameAccountRecord } from "../game-account/normalize";
import {
  computeFaceitAllTimeMetrics,
  computeFaceitRecentPerformance,
  computeFaceitRecentRecord,
  RECENT_MATCH_LIMIT,
} from "./faceit-metrics";

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

  const [
    rankedRows,
    recentRows,
    totalMatches,
    wins,
    kdRows,
    historyPeak,
  ] = await Promise.all([
    findCs2FaceitRankedEntries(gameAccountId),
    findRecentFaceitMatchPerformance(gameAccountId, RECENT_MATCH_LIMIT),
    countFaceitMatches(gameAccountId),
    countFaceitWins(gameAccountId),
    findFaceitMatchKdRows(gameAccountId),
    findFaceitEloPeak(gameAccountId),
  ]);

  const primaryRanked =
    rankedRows.find((row) => row.gameKey === "cs2") ?? rankedRows[0] ?? null;

  const faceitElo = primaryRanked?.faceitElo ?? null;
  const levelProgress =
    faceitElo !== null && faceitElo !== undefined
      ? getFaceitLevelProgress(faceitElo)
      : null;

  return {
    gameAccount: account,
    primaryRanked,
    levelProgress,
    allTimeMetrics: computeFaceitAllTimeMetrics({
      totalMatches,
      wins,
      kdRows,
      currentElo: faceitElo,
      historyPeak,
    }),
    recentRecord: computeFaceitRecentRecord(recentRows),
    recentPerformance: computeFaceitRecentPerformance(recentRows),
  };
}
