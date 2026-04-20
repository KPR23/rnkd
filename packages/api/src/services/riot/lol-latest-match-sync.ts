import { and, eq } from "drizzle-orm";

import {
  db,
  gameAccounts,
  GAMES,
  lolGameAccountProfiles,
  matches,
} from "@repo/db";

import { getLolAccountsOfFriends } from "../friend-game-accounts";
import { assertRiotRegion } from "./helper";
import { mapRiotMatchToDb } from "./lol-sync";
import { getMatchById, getMatchIdsByPuuid } from "./riot-client";
import type { RiotRegionalRoute } from "./types";

const RIOT_POLL_DELAY_MS = 150;

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

  const matchIds = await getMatchIdsByPuuid(account.externalId, region, 1);

  if (matchIds.length === 0) {
    return { ok: true, kind: "no_match_history" };
  }

  const headId = matchIds[0];
  if (headId === undefined) {
    return { ok: true, kind: "no_match_history" };
  }

  if (headId === account.lolProfile.lastMatchId) {
    return { ok: true, kind: "unchanged" };
  }

  const existsBefore = await db.query.matches.findFirst({
    where: and(
      eq(matches.externalMatchId, headId),
      eq(matches.gameId, GAMES.LOL),
    ),
  });

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

  const riotMatch = await getMatchById(headId, region);
  await mapRiotMatchToDb(riotMatch, knownAccountsByPuuid);

  const newMatchInDb = !existsBefore;

  await db
    .update(lolGameAccountProfiles)
    .set({ lastMatchId: headId })
    .where(eq(lolGameAccountProfiles.gameAccountId, account.id));

  return { ok: true, kind: "synced", newMatchInDb };
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
