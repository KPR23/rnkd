import { and, eq, inArray, or } from "drizzle-orm";

import { db, friendships, gameAccounts, GAMES } from "@repo/db";

import type { RiotParticipant } from "./riot/types";

export async function getLolAccountsOfFriends(userId: string) {
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
        eq(gameAccounts.gameId, GAMES.LOL),
      ),
    );

  return rows.map((r) => r.account);
}

export function getParticipantCs(participant: RiotParticipant) {
  return (
    (participant.totalMinionsKilled ?? 0) +
    (participant.neutralMinionsKilled ?? 0)
  );
}

export function getChampionIconUrl(championName: string) {
  //TODO
  const version = "16.4.1";

  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}
