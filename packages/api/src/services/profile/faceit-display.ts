import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";

import { getFaceitLevelProgress } from "@repo/types";
import { db, GAMES, cs2FaceitMatchPlayers, matches } from "@repo/db";
import { isCs2FaceitGameAccount } from "@repo/types";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import { findCs2FaceitRankedEntries } from "../../repositories/ranked.repo";
import { average } from "../../lib/average";
import { mapGameAccountRecord } from "../game-account/normalize";

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

  const rankedRows = await findCs2FaceitRankedEntries(gameAccountId);
  const primaryRanked =
    rankedRows.find((row) => row.gameKey === "cs2") ?? rankedRows[0] ?? null;

  const perfRows = await db
    .select({
      kills: cs2FaceitMatchPlayers.kills,
      deaths: cs2FaceitMatchPlayers.deaths,
      adr: cs2FaceitMatchPlayers.adr,
      headshotPct: cs2FaceitMatchPlayers.headshotPct,
      win: cs2FaceitMatchPlayers.win,
    })
    .from(cs2FaceitMatchPlayers)
    .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
    .where(
      and(
        eq(cs2FaceitMatchPlayers.gameAccountId, gameAccountId),
        eq(matches.gameId, GAMES.CS2_FACEIT),
      ),
    )
    .orderBy(desc(matches.playedAt))
    .limit(20);

  const kdRatios: number[] = [];
  let hsSum = 0;
  let hsCount = 0;
  let adrSum = 0;
  let adrCount = 0;
  let recentWins = 0;

  for (const row of perfRows) {
    if (row.win === true) {
      recentWins += 1;
    }
    const kills = row.kills ?? null;
    const deaths = row.deaths ?? null;
    if (
      kills !== null &&
      deaths !== null &&
      typeof kills === "number" &&
      typeof deaths === "number"
    ) {
      kdRatios.push(deaths > 0 ? kills / deaths : kills);
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

  const recentPlayed = perfRows.length;
  const recentLosses = recentPlayed > 0 ? recentPlayed - recentWins : 0;
  let recentWinRate: number | null = null;
  if (recentPlayed > 0) {
    recentWinRate = (recentWins / recentPlayed) * 100;
  }

  const faceitElo = primaryRanked?.faceitElo ?? null;
  const levelProgress =
    faceitElo !== null && faceitElo !== undefined
      ? getFaceitLevelProgress(faceitElo)
      : null;

  return {
    gameAccount: account,
    primaryRanked,
    levelProgress,
    recentRecord:
      recentPlayed > 0
        ? {
            wins: recentWins,
            losses: recentLosses,
            played: recentPlayed,
            winRate: recentWinRate ?? 0,
          }
        : null,
    recentPerformance: {
      avgKd: average(kdRatios),
      avgHsPct: hsCount > 0 ? hsSum / hsCount : null,
      avgAdr: adrCount > 0 ? adrSum / adrCount : null,
    },
  };
}
