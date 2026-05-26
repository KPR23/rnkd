import { GAMES } from "@repo/db";
import {
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type GameAccount,
  type RiotPlatformRoute,
} from "@repo/types";

import type { GameAccountRecord } from "../../repositories/game-accounts.repo";
import { refreshLolAccountDataInBackground } from "../riot/lol-profile-sync";

export const LOL_PROFILE_REFRESH_TTL_MS = 1000 * 60 * 30;

export function getEpochMs(
  value: Date | string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.getTime();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function mapGameAccountRecord(account: GameAccountRecord): GameAccount {
  const { lolProfile, cs2FaceitProfile, ...baseAccount } = account;

  switch (baseAccount.gameId) {
    case GAMES.LOL:
      if (!lolProfile) {
        throw new Error("Missing LoL profile for game account");
      }

      return {
        ...baseAccount,
        gameId: GAMES.LOL,
        profile: lolProfile,
      };
    case GAMES.CS2_FACEIT:
      return {
        ...baseAccount,
        gameId: GAMES.CS2_FACEIT,
        profile: cs2FaceitProfile,
      };
    default:
      throw new Error(`Unsupported game account type: ${baseAccount.gameId}`);
  }
}

export function normalizeGameAccounts(
  accounts: GameAccountRecord[],
  options: { refreshStaleLolProfiles: boolean },
) {
  if (options.refreshStaleLolProfiles) {
    for (const account of accounts) {
      if (account.gameId !== GAMES.LOL || !account.lolProfile) {
        continue;
      }

      const lastSyncedAtMs = getEpochMs(account.lastSyncedAt);
      const shouldRefresh =
        !lastSyncedAtMs ||
        Date.now() - lastSyncedAtMs > LOL_PROFILE_REFRESH_TTL_MS;
      if (!shouldRefresh) continue;

      refreshLolAccountDataInBackground(
        account.id,
        account.externalId,
        account.lolProfile.platformRoute as RiotPlatformRoute,
      );
    }
  }

  const normalizedAccounts = accounts.flatMap((account) => {
    try {
      return [mapGameAccountRecord(account)];
    } catch (error) {
      console.error("Skipping malformed game account", {
        accountId: account.id,
        error,
      });
      return [];
    }
  });

  return {
    lol: normalizedAccounts.filter(isLolGameAccount),
    faceit: normalizedAccounts.filter(isCs2FaceitGameAccount),
  };
}
