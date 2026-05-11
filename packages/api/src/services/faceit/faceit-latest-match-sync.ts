import { and, eq } from "drizzle-orm";

import {
  cs2FaceitMatchPlayers,
  db,
  gameAccounts,
  GAMES,
  matches,
  cs2FaceitGameAccountProfiles,
} from "@repo/db";

import type { FaceitMatchDetail, FaceitMatchStatsPayload } from "@repo/types";

import {
  getFaceitMatch,
  getFaceitMatchStats,
  getFaceitPlayerById,
  getFaceitPlayerHistory,
} from "./faceit-client";
import { persistFaceitSnapshotInTx } from "./faceit-profile-persist";
import {
  mergePlayerStatsFromRounds,
  buildFaceitPlayerTeamIndex,
  didPlayerWin,
} from "./faceit-stats";
import { getCs2FaceitAccountsOfFriends } from "../social/friend-game-accounts";

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
  const scoreVals = Object.values(detail.results?.score ?? {}).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  return {
    team1Score: scoreVals[0] ?? 0,
    team2Score: scoreVals[1] ?? 0,
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
      const agg = merged.get(faceitPlayerId);
      if (!agg) continue;

      const team = teamByPlayerId[faceitPlayerId];
      if (team === undefined) continue;

      const win = didPlayerWin(detail, team);
      const adrAvg =
        agg.adrSamples.length > 0
          ? agg.adrSamples.reduce((a, b) => a + b, 0) / agg.adrSamples.length
          : null;
      const hsAvg =
        agg.headshotPctSamples.length > 0
          ? agg.headshotPctSamples.reduce((a, b) => a + b, 0) /
            agg.headshotPctSamples.length
          : null;

      rows.push({
        matchId: matchRow.id,
        gameAccountId,
        team,
        win,
        kills: agg.kills,
        deaths: agg.deaths,
        assists: agg.assists,
        adr: adrAvg,
        headshotPct: hsAvg,
        rawStats: agg.rawMerged,
      });
    }

    if (rows.length > 0) {
      await tx
        .insert(cs2FaceitMatchPlayers)
        .values(rows)
        .onConflictDoNothing({
          target: [
            cs2FaceitMatchPlayers.matchId,
            cs2FaceitMatchPlayers.gameAccountId,
          ],
        });
    }

    return { match: matchRow, newMatchInDb: !existingMatch };
  });
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

  const head = items[0];
  const headId = head?.match_id;
  if (headId === undefined) {
    await refreshFaceitRankedForAccount(gameAccountId);
    return { ok: true, kind: "no_match_history" };
  }

  if (headId === account.cs2FaceitProfile.lastFaceitMatchId) {
    await refreshFaceitRankedForAccount(gameAccountId);
    return { ok: true, kind: "unchanged" };
  }

  const existedBefore = await db.query.matches.findFirst({
    where: and(
      eq(matches.externalMatchId, headId),
      eq(matches.gameId, GAMES.CS2_FACEIT),
    ),
  });

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

  const detail = await getFaceitMatch(headId);
  if (!detail) {
    await refreshFaceitRankedForAccount(gameAccountId);
    return { ok: false, error: "FACEIT match detail not found" };
  }

  const statsPayload = await getFaceitMatchStats(headId);

  await mapFaceitMatchToDb(detail, statsPayload, knownPlayersByFaceitId);

  const newMatchInDb = !existedBefore;

  await db
    .update(cs2FaceitGameAccountProfiles)
    .set({ lastFaceitMatchId: headId })
    .where(eq(cs2FaceitGameAccountProfiles.gameAccountId, gameAccountId));

  await refreshFaceitRankedForAccount(gameAccountId);

  return { ok: true, kind: "synced", newMatchInDb };
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
