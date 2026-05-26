import { eq, inArray } from "drizzle-orm";

import {
  cs2FaceitRankedEntries,
  db,
  lolRankedEntries,
} from "@repo/db";

export async function findLolRankedEntries(gameAccountId: string) {
  return db.query.lolRankedEntries.findMany({
    where: eq(lolRankedEntries.gameAccountId, gameAccountId),
  });
}

export async function findCs2FaceitRankedEntries(gameAccountId: string) {
  return db.query.cs2FaceitRankedEntries.findMany({
    where: eq(cs2FaceitRankedEntries.gameAccountId, gameAccountId),
  });
}

export async function findRankedEntriesForUserAccounts(accountIds: string[]) {
  if (accountIds.length === 0) {
    return { lol: [], faceit: [] };
  }

  const lol = await db.query.lolRankedEntries.findMany({
    where: inArray(lolRankedEntries.gameAccountId, accountIds),
  });

  const faceit = await db.query.cs2FaceitRankedEntries.findMany({
    where: inArray(cs2FaceitRankedEntries.gameAccountId, accountIds),
  });

  return { lol, faceit };
}
