import { and, eq } from "drizzle-orm";

import {
  db,
  gameAccounts,
  GAMES,
  lolGameAccountProfiles,
  lolRankedEntries,
} from "@repo/db";
import type { RiotPlatformRoute } from "@repo/types";

import { recomputeGlobalRs } from "../scoring/rnkd-score";
import {
  getLolAccountDetails,
  getLolLeagueEntriesByPuuid,
} from "../riot/riot-client";

type LolLeagueEntry = Awaited<
  ReturnType<typeof getLolLeagueEntriesByPuuid>
>[number];

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function persistLolRankedEntriesInTx(
  tx: DbTransaction,
  gameAccountId: string,
  entries: LolLeagueEntry[],
  syncedAt: Date,
) {
  await tx
    .delete(lolRankedEntries)
    .where(
      and(
        eq(lolRankedEntries.gameAccountId, gameAccountId),
        eq(lolRankedEntries.gameId, GAMES.LOL),
      ),
    );

  if (entries.length === 0) {
    return;
  }

  await tx.insert(lolRankedEntries).values(
    entries.map((entry) => ({
      gameAccountId,
      gameId: GAMES.LOL,
      queueType: entry.queueType,
      tier: entry.tier,
      rank: entry.rank || null,
      leaguePoints: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      hotStreak: entry.hotStreak,
      inactive: entry.inactive,
      syncedAt,
    })),
  );
}

export async function refreshLolRankedForAccount(gameAccountId: string) {
  const account = await db.query.gameAccounts.findFirst({
    where: eq(gameAccounts.id, gameAccountId),
    with: { lolProfile: true },
  });

  if (!account?.lolProfile) {
    return;
  }

  const entries = await getLolLeagueEntriesByPuuid(
    account.externalId,
    account.lolProfile.platformRoute,
  );
  const syncedAt = new Date();

  await db.transaction(async (tx) => {
    await persistLolRankedEntriesInTx(tx, gameAccountId, entries, syncedAt);
    await tx
      .update(gameAccounts)
      .set({ lastSyncedAt: syncedAt })
      .where(eq(gameAccounts.id, gameAccountId));
  });

  if (account.userId) {
    await recomputeGlobalRs(account.userId);
  }
}

export function refreshLolAccountDataInBackground(
  accountId: string,
  externalId: string,
  platformRoute: RiotPlatformRoute,
) {
  void (async () => {
    try {
      const details = await getLolAccountDetails(externalId, platformRoute);
      let entries: Awaited<
        ReturnType<typeof getLolLeagueEntriesByPuuid>
      > | null = null;

      try {
        entries = await getLolLeagueEntriesByPuuid(externalId, platformRoute);
      } catch (error) {
        console.error("Failed to refresh LoL ranked entries", {
          accountId,
          error,
        });
      }

      let userId: string | null = null;

      await db.transaction(async (tx) => {
        const syncedAt = new Date();
        const [account] = await tx
          .select({ userId: gameAccounts.userId })
          .from(gameAccounts)
          .where(eq(gameAccounts.id, accountId));

        userId = account?.userId ?? null;

        await tx
          .update(lolGameAccountProfiles)
          .set({
            profileIconId: details.profileIconId,
            summonerLevel: details.summonerLevel,
          })
          .where(eq(lolGameAccountProfiles.gameAccountId, accountId));

        await tx
          .update(gameAccounts)
          .set({
            lastSyncedAt: syncedAt,
          })
          .where(eq(gameAccounts.id, accountId));

        if (entries) {
          await persistLolRankedEntriesInTx(tx, accountId, entries, syncedAt);
        }
      });

      if (userId) {
        await recomputeGlobalRs(userId);
      }
    } catch (error) {
      console.error("Failed to refresh LoL account data", { accountId, error });
    }
  })();
}
