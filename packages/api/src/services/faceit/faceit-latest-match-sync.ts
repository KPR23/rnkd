import { and, eq, sql } from "drizzle-orm";

import {
  cs2FaceitGameAccountProfiles,
  cs2FaceitMatchPlayers,
  db,
  gameAccounts,
  GAMES,
  matches,
} from "@repo/db";
import type { FaceitMatchDetail, FaceitMatchStatsPayload } from "@repo/types";

import { recomputeGlobalRs } from "../scoring/rnkd-score";
import { getCs2FaceitAccountsOfFriends } from "../social/friend-game-accounts";
import {
  getFaceitMatch,
  getFaceitMatchStats,
  getFaceitPlayerById,
  getFaceitPlayerHistory,
} from "./faceit-client";
import { persistFaceitSnapshotInTx } from "./faceit-profile-persist";
import {
  buildFaceitPlayerTeamIndex,
  didPlayerWin,
  mergePlayerStatsFromRounds,
} from "./faceit-stats";

const FACEIT_POLL_DELAY_MS = 200;

export type SyncLatestFaceitMatchResult =
  | { ok: true; kind: "unchanged" }
  | { ok: true; kind: "no_match_history" }
  | { ok: true; kind: "synced"; newMatchInDb: boolean }
  | { ok: false; error: string };

export type SyncLatestFaceitMatchBatchSummary = {
  accountsChecked: number;
  unchanged: number;
  noMatchHistory: number;
  synced: number;
  newMatchesInDb: number;
  errors: { gameAccountId: string; message: string }[];
};

function matchScoresFromDetail(detail: FaceitMatchDetail): {
  team1Score: number;
  team2Score: number;
} {
  const score = detail.results?.score ?? {};
  const teamKeys = Object.keys(detail.teams ?? {});
  const team1Key = score.faction1 !== undefined ? "faction1" : teamKeys[0];
  const team2Key = score.faction2 !== undefined ? "faction2" : teamKeys[1];
  const team1Score = team1Key ? score[team1Key] : undefined;
  const team2Score = team2Key ? score[team2Key] : undefined;

  return {
    team1Score:
      typeof team1Score === "number" && Number.isFinite(team1Score)
        ? team1Score
        : 0,
    team2Score:
      typeof team2Score === "number" && Number.isFinite(team2Score)
        ? team2Score
        : 0,
  };
}

export async function mapFaceitMatchToDb(
  detail: FaceitMatchDetail,
  statsPayload: FaceitMatchStatsPayload | null,
  knownPlayersByFaceitId: Record<string, string>,
) {
  const merged = mergePlayerStatsFromRounds(statsPayload);
  const teamByPlayerId = buildFaceitPlayerTeamIndex(detail);

  return db.transaction(async (tx) => {
    const existingMatch = await tx.query.matches.findFirst({
      where: and(
        eq(matches.externalMatchId, detail.match_id),
        eq(matches.gameId, GAMES.CS2_FACEIT),
      ),
    });

    let matchRow = existingMatch;

    const { team1Score, team2Score } = matchScoresFromDetail(detail);
    const started = detail.started_at;
    const ended = detail.finished_at ?? started;
    if (ended === undefined) {
      throw new Error("FACEIT match has no playable timestamp");
    }

    const playedAt = new Date(ended * 1000);
    const durationSeconds =
      started !== undefined && ended !== undefined
        ? Math.max(0, ended - started)
        : null;

    if (!matchRow) {
      const [inserted] = await tx
        .insert(matches)
        .values({
          id: crypto.randomUUID(),
          gameId: GAMES.CS2_FACEIT,
          externalMatchId: detail.match_id,
          queueId: null,
          team1Score,
          team2Score,
          playedAt,
          durationSeconds,
        })
        .returning();

      if (!inserted) {
        throw new Error("Failed to insert FACEIT match");
      }

      matchRow = inserted;
    }

    const rows: (typeof cs2FaceitMatchPlayers.$inferInsert)[] = [];

    for (const [faceitPlayerId, gameAccountId] of Object.entries(
      knownPlayersByFaceitId,
    )) {
      const team = teamByPlayerId[faceitPlayerId];
      if (team === undefined) continue;

      const agg = merged.get(faceitPlayerId);
      const win = didPlayerWin(detail, team);
      const adrAvg =
        agg && agg.adrSamples.length > 0
          ? agg.adrSamples.reduce((a, b) => a + b, 0) / agg.adrSamples.length
          : null;
      const hsAvg =
        agg && agg.headshotPctSamples.length > 0
          ? agg.headshotPctSamples.reduce((a, b) => a + b, 0) /
            agg.headshotPctSamples.length
          : null;

      rows.push({
        matchId: matchRow.id,
        gameAccountId,
        team,
        win,
        kills: agg?.kills ?? null,
        deaths: agg?.deaths ?? null,
        assists: agg?.assists ?? null,
        adr: adrAvg,
        headshotPct: hsAvg,
        rawStats: agg?.rawMerged ?? undefined,
      });
    }

    if (rows.length > 0) {
      await tx
        .insert(cs2FaceitMatchPlayers)
        .values(rows)
        .onConflictDoUpdate({
          target: [
            cs2FaceitMatchPlayers.matchId,
            cs2FaceitMatchPlayers.gameAccountId,
          ],
          set: {
            team: sql.raw(`excluded.${cs2FaceitMatchPlayers.team.name}`),
            win: sql.raw(`excluded.${cs2FaceitMatchPlayers.win.name}`),
            kills: sql.raw(`excluded.${cs2FaceitMatchPlayers.kills.name}`),
            deaths: sql.raw(`excluded.${cs2FaceitMatchPlayers.deaths.name}`),
            assists: sql.raw(`excluded.${cs2FaceitMatchPlayers.assists.name}`),
            adr: sql.raw(`excluded.${cs2FaceitMatchPlayers.adr.name}`),
            headshotPct: sql.raw(
              `excluded.${cs2FaceitMatchPlayers.headshotPct.name}`,
            ),
            rawStats: sql.raw(
              `excluded.${cs2FaceitMatchPlayers.rawStats.name}`,
            ),
          },
        });
    }

    return { match: matchRow, newMatchInDb: !existingMatch };
  });
}

async function syncMissingFaceitMatchesFromHistoryPage(params: {
  gameAccountId: string;
  historyItemsNewestFirst: { match_id: string }[];
  knownPlayersByFaceitId: Record<string, string>;
}): Promise<boolean> {
  const { gameAccountId, historyItemsNewestFirst, knownPlayersByFaceitId } =
    params;

  let anyWork = false;

  for (const h of historyItemsNewestFirst) {
    const mid = h.match_id;

    const matchRow = await db.query.matches.findFirst({
      where: and(
        eq(matches.externalMatchId, mid),
        eq(matches.gameId, GAMES.CS2_FACEIT),
      ),
      columns: { id: true },
    });

    if (matchRow) {
      const participant = await db.query.cs2FaceitMatchPlayers.findFirst({
        where: and(
          eq(cs2FaceitMatchPlayers.matchId, matchRow.id),
          eq(cs2FaceitMatchPlayers.gameAccountId, gameAccountId),
        ),
        columns: { id: true },
      });
      if (participant) continue;
    }

    const detail = await getFaceitMatch(mid);
    if (!detail) continue;

    let statsPayload: FaceitMatchStatsPayload | null = null;
    try {
      statsPayload = await getFaceitMatchStats(mid);
    } catch {
      statsPayload = null;
    }

    try {
      await mapFaceitMatchToDb(detail, statsPayload, knownPlayersByFaceitId);
      anyWork = true;
    } catch {
      continue;
    }

    await new Promise((r) => setTimeout(r, FACEIT_POLL_DELAY_MS));
  }

  return anyWork;
}

async function refreshFaceitRankedForAccount(gameAccountId: string) {
  const account = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.id, gameAccountId),
      eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
    ),
  });
  if (!account) return;

  const player = await getFaceitPlayerById(account.externalId);
  if (!player) {
    return;
  }

  const syncedAt = new Date();
  await db.transaction(async (tx) => {
    await persistFaceitSnapshotInTx(tx, {
      gameAccountId,
      player,
      syncedAt,
    });
  });

  if (account.userId) {
    await recomputeGlobalRs(account.userId);
  }
}

export async function syncLatestFaceitMatchForAccount(
  gameAccountId: string,
): Promise<SyncLatestFaceitMatchResult> {
  const account = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.id, gameAccountId),
      eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
    ),
    with: {
      cs2FaceitProfile: true,
    },
  });

  if (!account?.cs2FaceitProfile) {
    return { ok: false, error: "FACEIT account or profile not found" };
  }

  if (!account.isTracked) {
    return { ok: false, error: "Account is not tracked" };
  }

  const history = await getFaceitPlayerHistory(account.externalId, {
    limit: 20,
    offset: 0,
  });

  const items = (history?.items ?? []).filter(
    (h) => typeof h.match_id === "string" && h.match_id.length > 0,
  );

  if (items.length === 0) {
    await refreshFaceitRankedForAccount(gameAccountId);
    return { ok: true, kind: "no_match_history" };
  }

  const sortKey = (h: (typeof items)[number]) =>
    h.finished_at ?? h.started_at ?? 0;

  items.sort((a, b) => sortKey(b) - sortKey(a));

  const headId = items[0]?.match_id;
  if (headId === undefined) {
    await refreshFaceitRankedForAccount(gameAccountId);
    return { ok: true, kind: "no_match_history" };
  }

  const watermark = account.cs2FaceitProfile.lastFaceitMatchId ?? null;

  const followedAccounts = account.userId
    ? await getCs2FaceitAccountsOfFriends(account.userId)
    : [];

  const knownPlayersByFaceitId: Record<string, string> = {
    [account.externalId]: account.id,
    ...followedAccounts.reduce(
      (acc, followed) => {
        acc[followed.externalId] = followed.id;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  let anyWork = false;
  try {
    anyWork = await syncMissingFaceitMatchesFromHistoryPage({
      gameAccountId,
      historyItemsNewestFirst: items,
      knownPlayersByFaceitId,
    });
  } catch {
    anyWork = false;
  }

  await refreshFaceitRankedForAccount(gameAccountId);

  if (!anyWork && watermark === headId) {
    return { ok: true, kind: "unchanged" };
  }

  await db
    .update(cs2FaceitGameAccountProfiles)
    .set({ lastFaceitMatchId: headId })
    .where(eq(cs2FaceitGameAccountProfiles.gameAccountId, gameAccountId));

  return { ok: true, kind: "synced", newMatchInDb: anyWork };
}

export async function syncLatestFaceitMatchForAllTrackedAccounts(): Promise<SyncLatestFaceitMatchBatchSummary> {
  const accounts = await db.query.gameAccounts.findMany({
    where: and(
      eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
      eq(gameAccounts.isTracked, true),
    ),
    columns: { id: true },
  });

  const summary: SyncLatestFaceitMatchBatchSummary = {
    accountsChecked: accounts.length,
    unchanged: 0,
    noMatchHistory: 0,
    synced: 0,
    newMatchesInDb: 0,
    errors: [],
  };

  for (const { id } of accounts) {
    try {
      const result = await syncLatestFaceitMatchForAccount(id);
      if (!result.ok) {
        summary.errors.push({ gameAccountId: id, message: result.error });
      } else {
        switch (result.kind) {
          case "unchanged":
            summary.unchanged += 1;
            break;
          case "no_match_history":
            summary.noMatchHistory += 1;
            break;
          case "synced":
            summary.synced += 1;
            if (result.newMatchInDb) {
              summary.newMatchesInDb += 1;
            }
            break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.errors.push({ gameAccountId: id, message });
    }
    await new Promise((r) => setTimeout(r, FACEIT_POLL_DELAY_MS));
  }

  return summary;
}
