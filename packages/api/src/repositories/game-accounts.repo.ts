import { and, eq } from "drizzle-orm";

import {
  cs2FaceitGameAccountProfiles,
  db,
  gameAccounts,
  lolGameAccountProfiles,
} from "@repo/db";

import type { DbExecutor } from "./db-executor";

export type GameAccountRecord = typeof gameAccounts.$inferSelect & {
  lolProfile: typeof lolGameAccountProfiles.$inferSelect | null;
  cs2FaceitProfile: typeof cs2FaceitGameAccountProfiles.$inferSelect | null;
};

export async function findGameAccountById(
  gameAccountId: string,
  executor: DbExecutor = db,
): Promise<GameAccountRecord | undefined> {
  return executor.query.gameAccounts.findFirst({
    where: eq(gameAccounts.id, gameAccountId),
    with: {
      lolProfile: true,
      cs2FaceitProfile: true,
    },
  });
}

export async function findGameAccountsByUserId(
  userId: string,
  executor: DbExecutor = db,
): Promise<GameAccountRecord[]> {
  return executor.query.gameAccounts.findMany({
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
  executor: DbExecutor = db,
) {
  const [row] = await executor
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
