import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db, games, user } from "@repo/db";

import {
  findGameAccountsByUserId,
  type GameAccountRecord,
} from "../../repositories/game-accounts.repo";
import {
  getLastActiveAtForUser,
} from "../../repositories/match-history.repo";
import type { UpdateProfileInput } from "../../schemas/profile";
import {
  mapGameAccountRecord,
  normalizeGameAccounts,
} from "../game-account/normalize";

export async function getProfileOverview(userId: string) {
  const row = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const favoriteGame = row.favoriteGameId
    ? await db.query.games.findFirst({
        where: eq(games.id, row.favoriteGameId),
      })
    : null;

  const accountRecords = await findGameAccountsByUserId(userId);
  const gameAccounts = normalizeGameAccounts(accountRecords, {
    refreshStaleLolProfiles: false,
  });

  const lastActiveAt = await getLastActiveAtForUser(userId);

  return {
    user: {
      id: row.id,
      name: row.name,
      tag: row.tag,
      image: row.image,
      bio: row.bio,
      region: row.region,
      globalRs: row.globalRs,
      favoriteGame: favoriteGame
        ? { id: favoriteGame.id, name: favoriteGame.name }
        : null,
    },
    gameAccounts,
    lastActiveAt,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  if (input.favoriteGameId) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, input.favoriteGameId),
    });

    if (!game) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid favorite game",
      });
    }
  }

  const [updated] = await db
    .update(user)
    .set({
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.favoriteGameId !== undefined
        ? { favoriteGameId: input.favoriteGameId }
        : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
    })
    .where(eq(user.id, userId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return getProfileOverview(userId);
}

export function summarizeGameAccounts(records: GameAccountRecord[]) {
  return records.flatMap((record) => {
    try {
      return [mapGameAccountRecord(record)];
    } catch {
      return [];
    }
  });
}
