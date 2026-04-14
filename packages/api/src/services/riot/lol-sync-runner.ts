import { and, eq } from "drizzle-orm";

import { db, gameAccounts, GAMES } from "@repo/db";

import { getLolAccountsOfFriends } from "../helper";
import { assertRiotRegion } from "./helper";
import { mapRiotMatchToDb } from "./lol-sync";
import { getMatchById, getMatchIdsByPuuid } from "./riot";
import type { RiotRegionalRoute } from "./types";

const MAX_MATCHES_TO_SYNC = 100;
const RIOT_API_DELAY_MS = 150;

export async function syncLolForAccount(
  gameAccountId: string,
  maxMatchesToSync: number = MAX_MATCHES_TO_SYNC,
) {
  const account = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.id, gameAccountId),
      eq(gameAccounts.gameId, GAMES.LOL),
    ),
    with: {
      lolProfile: true,
    },
  });

  if (!account || !account.userId || !account.lolProfile) {
    throw new Error("Account not found");
  }

  const followedLolAccounts = await getLolAccountsOfFriends(account.userId);

  assertRiotRegion(account.lolProfile.regionalRoute);

  const matchIds = await getMatchIdsByPuuid(
    account.externalId,
    account.lolProfile.regionalRoute,
    maxMatchesToSync,
  );

  const riotMatches: Awaited<ReturnType<typeof getMatchById>>[] = [];

  for (const id of matchIds.slice(0, maxMatchesToSync)) {
    riotMatches.push(
      await getMatchById(
        id,
        account.lolProfile.regionalRoute as RiotRegionalRoute,
      ),
    );
    await new Promise((r) => setTimeout(r, RIOT_API_DELAY_MS));
  }

  const knownAccountsByPuuid: Record<string, string> = {
    [account.externalId]: gameAccountId,
    ...followedLolAccounts.reduce(
      (acc, followedAccount) => {
        acc[followedAccount.externalId] = followedAccount.id;
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  const savedMatches = await Promise.all(
    riotMatches.map((match) => mapRiotMatchToDb(match, knownAccountsByPuuid)),
  );

  return savedMatches.length;
}
