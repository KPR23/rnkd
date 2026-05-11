import { and, eq } from "drizzle-orm";

import {
  db,
  gameAccounts,
  GAMES,
  lolGameAccountProfiles,
  matches,
  matchParticipants,
} from "@repo/db";

import { getLolAccountsOfFriends } from "../social/friend-game-accounts";
import { assertRiotRegion } from "./helper";
import { mapRiotMatchToDb } from "./lol-sync";
import { getMatchById, getMatchIdsByPuuid } from "./riot-client";
import type { RiotRegionalRoute } from "./types";

const RIOT_POLL_DELAY_MS = 150;
const LOL_MATCH_HISTORY_PAGE_SIZE = 20;

export type SyncLatestLolMatchResult =
  | { ok: true; kind: "unchanged" }
  | { ok: true; kind: "no_match_history" }
  | { ok: true; kind: "synced"; newMatchInDb: boolean }
  | { ok: false; error: string };

export type SyncLatestLolMatchBatchSummary = {
  accountsChecked: number;
  unchanged: number;
  noMatchHistory: number;
  synced: number;
  newMatchesInDb: number;
  errors: { gameAccountId: string; message: string }[];
};

export async function syncLatestLolMatchForAccount(
  gameAccountId: string,
): Promise<SyncLatestLolMatchResult> {
  const account = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.id, gameAccountId),
      eq(gameAccounts.gameId, GAMES.LOL),
    ),
    with: {
      lolProfile: true,
    },
  });

  if (!account?.lolProfile) {
    return { ok: false, error: "LoL account or profile not found" };
  }

  if (!account.isTracked) {
    return { ok: false, error: "Account is not tracked" };
  }

  assertRiotRegion(account.lolProfile.regionalRoute);

  const region = account.lolProfile.regionalRoute as RiotRegionalRoute;

  const matchIds = await getMatchIdsByPuuid(
    account.externalId,
    region,
    LOL_MATCH_HISTORY_PAGE_SIZE,
  );

  if (matchIds.length === 0) {
    return { ok: true, kind: "no_match_history" };
  }

  const headId = matchIds[0];
  if (headId === undefined) {
    return { ok: true, kind: "no_match_history" };
  }

  const lastWatermark = account.lolProfile.lastMatchId ?? null;

  const pendingNewestFirst: string[] = [];
  for (const mid of matchIds) {
    if (lastWatermark !== null && mid === lastWatermark) break;
    pendingNewestFirst.push(mid);
  }

  /**
   * When the newest Riot ID matches our watermark we used to exit as "unchanged".
   * If `match_participants` were never written (older bugs / cross-account ingestion),
   * history stays empty forever. Always walk the current Riot page once to repair links.
   */
  const needsParticipantRepair = pendingNewestFirst.length === 0;

  const queueOldestFirst = needsParticipantRepair
    ? [...matchIds].reverse()
    : pendingNewestFirst.slice().reverse();

  const followedLolAccounts = account.userId
    ? await getLolAccountsOfFriends(account.userId)
    : [];

  const knownAccountsByPuuid: Record<string, string> = {
    [account.externalId]: account.id,
    ...followedLolAccounts.reduce(
      (acc, followedAccount) => {
        acc[followedAccount.externalId] = followedAccount.id;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  let anyNewMatchInDb = false;
  let lastSuccessfulMatchId: string | null = null;
  let syncError: string | null = null;

  for (const mid of queueOldestFirst) {
    try {
      const existedBefore = await db.query.matches.findFirst({
        where: and(
          eq(matches.externalMatchId, mid),
          eq(matches.gameId, GAMES.LOL),
        ),
        columns: { id: true },
      });

      if (existedBefore) {
        const alreadyLinked = await db.query.matchParticipants.findFirst({
          where: and(
            eq(matchParticipants.matchId, existedBefore.id),
            eq(matchParticipants.gameAccountId, account.id),
          ),
          columns: { id: true },
        });

        if (!alreadyLinked) {
          const riotMatch = await getMatchById(mid, region);
          await mapRiotMatchToDb(riotMatch, knownAccountsByPuuid);
          anyNewMatchInDb = true;
        }
      } else {
        const riotMatch = await getMatchById(mid, region);
        await mapRiotMatchToDb(riotMatch, knownAccountsByPuuid);
        anyNewMatchInDb = true;
      }

      lastSuccessfulMatchId = mid;
    } catch (error) {
      syncError =
        error instanceof Error ? error.message : String(error ?? "riot");
      break;
    }

    await new Promise((r) => setTimeout(r, RIOT_POLL_DELAY_MS));
  }

  if (syncError !== null && lastSuccessfulMatchId === null) {
    return { ok: false, error: syncError };
  }

  const watermarkAfterSync =
    syncError === null ? headId : lastSuccessfulMatchId!;

  await db
    .update(lolGameAccountProfiles)
    .set({ lastMatchId: watermarkAfterSync })
    .where(eq(lolGameAccountProfiles.gameAccountId, account.id));

  if (needsParticipantRepair && !anyNewMatchInDb) {
    return { ok: true, kind: "unchanged" };
  }

  return { ok: true, kind: "synced", newMatchInDb: anyNewMatchInDb };
}

export async function syncLatestLolMatchForAllTrackedAccounts(): Promise<SyncLatestLolMatchBatchSummary> {
  const accounts = await db.query.gameAccounts.findMany({
    where: and(
      eq(gameAccounts.gameId, GAMES.LOL),
      eq(gameAccounts.isTracked, true),
    ),
    columns: { id: true },
  });

  const summary: SyncLatestLolMatchBatchSummary = {
    accountsChecked: accounts.length,
    unchanged: 0,
    noMatchHistory: 0,
    synced: 0,
    newMatchesInDb: 0,
    errors: [],
  };

  for (const { id } of accounts) {
    try {
      const result = await syncLatestLolMatchForAccount(id);
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
          default: {
            const _exhaustive: never = result;
            return _exhaustive;
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.errors.push({ gameAccountId: id, message });
    }
    await new Promise((r) => setTimeout(r, RIOT_POLL_DELAY_MS));
  }

  return summary;
}
