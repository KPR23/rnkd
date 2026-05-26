import { and, eq } from "drizzle-orm";

import {
  cs2FaceitGameAccountProfiles,
  db,
  gameAccounts,
  lolGameAccountProfiles,
} from "@repo/db";

export type GameAccountRecord = typeof gameAccounts.$inferSelect & {
  lolProfile: typeof lolGameAccountProfiles.$inferSelect | null;
  cs2FaceitProfile: typeof cs2FaceitGameAccountProfiles.$inferSelect | null;
};

export async function findGameAccountById(
  gameAccountId: string,
): Promise<GameAccountRecord | undefined> {
  return db.query.gameAccounts.findFirst({
    where: eq(gameAccounts.id, gameAccountId),
    with: {
      lolProfile: true,
      cs2FaceitProfile: true,
    },
  });
}

export async function findGameAccountsByUserId(
  userId: string,
): Promise<GameAccountRecord[]> {
  return db.query.gameAccounts.findMany({
    where: eq(gameAccounts.userId, userId),
    with: {
      lolProfile: true,
      cs2FaceitProfile: true,
    },
  });
}

export async function findTrackedGameAccountsByUserId(userId: string) {
  return db.query.gameAccounts.findMany({
    where: and(
      eq(gameAccounts.userId, userId),
      eq(gameAccounts.isTracked, true),
    ),
    columns: { id: true, gameId: true },
  });
}

export async function findGameAccountByIdAndGameId(
  gameAccountId: string,
  gameId: string,
) {
  const [row] = await db
    .select()
    .from(gameAccounts)
    .where(
      and(
        eq(gameAccounts.id, gameAccountId),
        eq(gameAccounts.gameId, gameId),
      ),
    );

  return row;
}
