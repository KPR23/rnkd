import { and, eq } from "drizzle-orm";

import {
  cs2FaceitGameAccountProfiles,
  cs2FaceitRankedEntries,
  db,
  gameAccounts,
  GAMES,
} from "@repo/db";
import type { FaceitPlayer } from "@repo/types";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function persistFaceitSnapshotInTx(
  tx: DbTx,
  params: {
    gameAccountId: string;
    player: FaceitPlayer;
    syncedAt: Date;
  },
) {
  const { gameAccountId, player, syncedAt } = params;

  const updatedProfiles = await tx
    .update(cs2FaceitGameAccountProfiles)
    .set({
      faceitNickname: player.nickname,
      steamNickname: player.steam_nickname ?? null,
      avatar: player.avatar ?? null,
      country: player.country ?? null,
      membershipType: player.membership_type ?? null,
      verified: player.verified,
      activatedAt: player.activated_at ? new Date(player.activated_at) : null,
      syncedAt,
    })
    .where(eq(cs2FaceitGameAccountProfiles.gameAccountId, gameAccountId))
    .returning({ gameAccountId: cs2FaceitGameAccountProfiles.gameAccountId });

  if (updatedProfiles.length === 0) {
    throw new Error(
      `FACEIT profile not found for game account ${gameAccountId}`,
    );
  }

  await tx
    .delete(cs2FaceitRankedEntries)
    .where(
      and(
        eq(cs2FaceitRankedEntries.gameAccountId, gameAccountId),
        eq(cs2FaceitRankedEntries.gameId, GAMES.CS2_FACEIT),
      ),
    );

  const rankedEntries = Object.entries(player.games).flatMap(
    ([gameKey, game]) =>
      game
        ? [
            {
              gameAccountId,
              gameId: GAMES.CS2_FACEIT,
              gameKey,
              faceitElo: game.faceit_elo ?? null,
              skillLevel: game.skill_level ?? null,
              region: game.region ?? null,
              gamePlayerId: game.game_player_id ?? null,
              gamePlayerName: game.game_player_name ?? null,
              syncedAt,
            },
          ]
        : [],
  );

  if (rankedEntries.length > 0) {
    await tx.insert(cs2FaceitRankedEntries).values(rankedEntries);
  }

  const updatedAccounts = await tx
    .update(gameAccounts)
    .set({ lastSyncedAt: syncedAt })
    .where(eq(gameAccounts.id, gameAccountId))
    .returning({ id: gameAccounts.id });

  if (updatedAccounts.length === 0) {
    throw new Error(`Game account not found for FACEIT sync ${gameAccountId}`);
  }
}
