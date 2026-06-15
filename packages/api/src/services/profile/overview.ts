import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";

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

async function assertTagAvailable(userId: string, tag: string) {
  const existing = await db.query.user.findFirst({
    where: and(eq(user.tag, tag), ne(user.id, userId)),
    columns: { id: true },
  });

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This nickname is already taken",
    });
  }
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const favoriteGameId =
    input.favoriteGameId?.trim() === "" ? null : input.favoriteGameId?.trim();

  if (favoriteGameId !== null && favoriteGameId !== undefined) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, favoriteGameId),
    });

    if (!game) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid favorite game",
      });
    }
  }

  if (input.tag) {
    await assertTagAvailable(userId, input.tag);
  }

  const [updated] = await db
    .update(user)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(favoriteGameId !== undefined
        ? { favoriteGameId }
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
    } catch (error) {
      console.error("Failed to map game account record", { record, error });
      return [];
    }
  });
}
