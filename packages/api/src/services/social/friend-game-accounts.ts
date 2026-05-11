import { and, eq, inArray, or } from "drizzle-orm";

import { db, friendships, gameAccounts, GAMES } from "@repo/db";

async function getGameAccountsOfFriends(userId: string, gameId: string) {
  const accepted = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterUserId, userId),
          eq(friendships.addresseeUserId, userId),
        ),
      ),
    );

  const otherUserIds = accepted.map((r) =>
    r.requesterUserId === userId ? r.addresseeUserId : r.requesterUserId,
  );

  if (otherUserIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ account: gameAccounts })
    .from(gameAccounts)
    .where(
      and(
        inArray(gameAccounts.userId, otherUserIds),
        eq(gameAccounts.gameId, gameId),
      ),
    );

  return rows.map((r) => r.account);
}

export async function getLolAccountsOfFriends(userId: string) {
  return getGameAccountsOfFriends(userId, GAMES.LOL);
}

export async function getCs2FaceitAccountsOfFriends(userId: string) {
  return getGameAccountsOfFriends(userId, GAMES.CS2_FACEIT);
}
