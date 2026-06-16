import { and, eq } from "drizzle-orm";

import {
  cs2FaceitGameAccountProfiles,
  db,
  gameAccounts,
  games,
  GAMES,
  lolGameAccountProfiles,
} from "@repo/db";
import {
  isCs2FaceitGameAccount,
  isLolGameAccount,
  RIOT_PLATFORM_TO_REGIONAL_ROUTE,
  type RiotPlatformRoute,
  type RiotRegionalRoute,
} from "@repo/types";

import {
  findGameAccountById,
  type GameAccountRecord,
} from "../../repositories/game-accounts.repo";
import { getFaceitPlayer } from "../faceit/faceit-client";
import { syncLatestFaceitMatchForAccount } from "../faceit/faceit-latest-match-sync";
import { persistFaceitSnapshotInTx } from "../faceit/faceit-profile-persist";
import { isValidPlatformRoute } from "../riot/helper";
import { syncLatestLolMatchForAccount } from "../riot/lol-latest-match-sync";
import { persistLolRankedEntriesInTx } from "../riot/lol-profile-sync";
import {
  getAccountByRiotId,
  getLolAccountDetails,
  getLolActiveRegionByPuuid,
  getLolLeagueEntriesByPuuid,
} from "../riot/riot-client";
import { recomputeGlobalRs } from "../scoring/rnkd-score";
import { isGameAccountUniqueViolation } from "./errors";
import { mapGameAccountRecord } from "./normalize";

export async function linkLolAccount(input: {
  userId: string;
  gameName: string;
  tagLine: string;
  platform?: RiotPlatformRoute;
  region?: RiotRegionalRoute;
}) {
  const regionalRoute = input.platform
    ? RIOT_PLATFORM_TO_REGIONAL_ROUTE[input.platform]
    : input.region;

  if (!regionalRoute) {
    throw new Error("Either platform or region is required to link LoL account");
  }

  const riotAccount = await getAccountByRiotId(
    input.gameName,
    input.tagLine,
    regionalRoute,
  );

  const existingAccount = await db.query.gameAccounts.findFirst({
    where: and(
      eq(gameAccounts.gameId, GAMES.LOL),
      eq(gameAccounts.externalId, riotAccount.puuid),
    ),
  });

  if (existingAccount) {
    return { error: "CONFLICT" as const };
  }

  const activeRegion =
    input.platform ??
    (await getLolActiveRegionByPuuid(riotAccount.puuid, regionalRoute));

  if (!isValidPlatformRoute(activeRegion)) {
    return { error: "UNSUPPORTED_PLATFORM" as const, activeRegion };
  }

  const details = await getLolAccountDetails(riotAccount.puuid, activeRegion);
  let entries: Awaited<ReturnType<typeof getLolLeagueEntriesByPuuid>> = [];
  try {
    entries = await getLolLeagueEntriesByPuuid(riotAccount.puuid, activeRegion);
  } catch (error) {
    console.error("Failed to fetch initial LoL ranked entries", {
      puuid: riotAccount.puuid,
      platformRoute: activeRegion,
      error,
    });
  }
  const syncedAt = new Date();

  const createdAccount = await db.transaction(async (tx) => {
    await tx
      .insert(games)
      .values({ id: GAMES.LOL, name: "League of Legends" })
      .onConflictDoNothing();

    const [gameAccount] = await tx
      .insert(gameAccounts)
      .values({
        id: crypto.randomUUID(),
        userId: input.userId,
        gameId: GAMES.LOL,
        externalId: riotAccount.puuid,
        lastSyncedAt: null,
        isTracked: true,
      })
      .returning();

    if (!gameAccount) {
      throw new Error("Failed to create LoL game account");
    }

    const [lolProfile] = await tx
      .insert(lolGameAccountProfiles)
      .values({
        gameAccountId: gameAccount.id,
        gameId: GAMES.LOL,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        profileIconId: details.profileIconId,
        summonerLevel: details.summonerLevel,
        regionalRoute,
        platformRoute: activeRegion,
      })
      .returning();

    if (!lolProfile) {
      throw new Error("Failed to create LoL account profile");
    }

    if (entries.length > 0) {
      await persistLolRankedEntriesInTx(tx, gameAccount.id, entries, syncedAt);
    }

    await tx
      .update(gameAccounts)
      .set({ lastSyncedAt: syncedAt })
      .where(eq(gameAccounts.id, gameAccount.id));

    return mapGameAccountRecord({
      ...gameAccount,
      lastSyncedAt: syncedAt,
      lolProfile,
      cs2FaceitProfile: null,
    });
  });

  if (!isLolGameAccount(createdAccount)) {
    throw new Error("Created account is not a LoL account");
  }

  try {
    await syncLatestLolMatchForAccount(createdAccount.id);
  } catch (error) {
    console.error("Failed to seed latest LoL match", { error });
  }

  await recomputeGlobalRs(input.userId);

  return { account: createdAccount };
}

export async function linkFaceitAccount(input: {
  userId: string;
  externalId: string;
}) {
  const player = await getFaceitPlayer(input.externalId);

  if (!player) {
    throw new Error("Failed to get Faceit player");
  }

  const syncedAt = new Date();

  const createdAccountRecord = await db.transaction(async (tx) => {
    await tx
      .insert(games)
      .values({ id: GAMES.CS2_FACEIT, name: "CS2 (FACEIT)" })
      .onConflictDoNothing();

    const [gameAccount] = await tx
      .insert(gameAccounts)
      .values({
        id: crypto.randomUUID(),
        userId: input.userId,
        gameId: GAMES.CS2_FACEIT,
        externalId: player.player_id,
        lastSyncedAt: null,
        isTracked: true,
      })
      .returning();

    if (!gameAccount) {
      throw new Error("Failed to create Faceit game account");
    }

    await tx.insert(cs2FaceitGameAccountProfiles).values({
      gameAccountId: gameAccount.id,
      gameId: GAMES.CS2_FACEIT,
    });

    await persistFaceitSnapshotInTx(tx, {
      gameAccountId: gameAccount.id,
      player,
      syncedAt,
    });

    const refreshedProfile =
      await tx.query.cs2FaceitGameAccountProfiles.findFirst({
        where: eq(cs2FaceitGameAccountProfiles.gameAccountId, gameAccount.id),
      });

    return mapGameAccountRecord({
      ...gameAccount,
      lastSyncedAt: syncedAt,
      lolProfile: null,
      cs2FaceitProfile: refreshedProfile ?? null,
    });
  });

  if (!isCs2FaceitGameAccount(createdAccountRecord)) {
    throw new Error("Created account is not a FACEIT account");
  }

  try {
    await syncLatestFaceitMatchForAccount(createdAccountRecord.id);
  } catch (error) {
    console.error("Failed to seed latest FACEIT match", { error });
  }

  await recomputeGlobalRs(input.userId);

  return createdAccountRecord;
}

export { isGameAccountUniqueViolation };

export async function unlinkGameAccount(input: {
  userId: string;
  gameAccountId: string;
  gameId: string;
}) {
  const result = await db.transaction(async (tx) => {
    const gameAccount = await tx.query.gameAccounts.findFirst({
      where: and(
        eq(gameAccounts.id, input.gameAccountId),
        eq(gameAccounts.gameId, input.gameId),
        eq(gameAccounts.userId, input.userId),
      ),
      with: {
        lolProfile: true,
        cs2FaceitProfile: true,
      },
    });

    if (!gameAccount) {
      return { error: "NOT_FOUND" as const };
    }

    if (
      input.gameId === GAMES.LOL &&
      !(gameAccount as GameAccountRecord).lolProfile
    ) {
      return { error: "NOT_FOUND" as const };
    }

    if (
      input.gameId === GAMES.CS2_FACEIT &&
      !(gameAccount as GameAccountRecord).cs2FaceitProfile
    ) {
      return { error: "NOT_FOUND" as const };
    }

    await tx
      .delete(gameAccounts)
      .where(
        and(
          eq(gameAccounts.id, input.gameAccountId),
          eq(gameAccounts.gameId, input.gameId),
          eq(gameAccounts.userId, input.userId),
        ),
      );
    return { success: true as const };
  });

  if ("success" in result) {
    await recomputeGlobalRs(input.userId);
  }

  return result;
}

export async function getOwnedGameAccount(
  userId: string,
  gameAccountId: string,
) {
  const account = await findGameAccountById(gameAccountId);
  if (!account || account.userId !== userId) {
    return null;
  }
  return account;
}
