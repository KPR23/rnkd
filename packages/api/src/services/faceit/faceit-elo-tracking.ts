import { desc, eq, sql } from "drizzle-orm";

import { db, eloHistory } from "@repo/db";

import { getFaceitPlayerById } from "./faceit-client";
import { resolveCs2FaceitElo } from "./faceit-player";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function recordEloSnapshotInTx(
  tx: DbTx,
  params: {
    gameAccountId: string;
    elo: number;
    matchId?: string | null;
  },
) {
  if (!Number.isFinite(params.elo) || params.elo <= 0) {
    return;
  }

  if (params.matchId) {
    await tx
      .insert(eloHistory)
      .values({
        id: crypto.randomUUID(),
        gameAccountId: params.gameAccountId,
        matchId: params.matchId,
        elo: params.elo,
      })
      .onConflictDoUpdate({
        target: [eloHistory.gameAccountId, eloHistory.matchId],
        targetWhere: sql`${eloHistory.matchId} IS NOT NULL`,
        set: { elo: sql`excluded.elo` },
        setWhere: sql`${eloHistory.elo} <> excluded.elo`,
      });
    return;
  }

  const [latest] = await tx
    .select({ elo: eloHistory.elo })
    .from(eloHistory)
    .where(eq(eloHistory.gameAccountId, params.gameAccountId))
    .orderBy(desc(eloHistory.createdAt))
    .limit(1);

  if (latest?.elo === params.elo) {
    return;
  }

  await tx.insert(eloHistory).values({
    id: crypto.randomUUID(),
    gameAccountId: params.gameAccountId,
    matchId: params.matchId ?? null,
    elo: params.elo,
  });
}

async function fetchCurrentFaceitElo(faceitPlayerId: string): Promise<number | null> {
  const player = await getFaceitPlayerById(faceitPlayerId);
  if (!player) {
    return null;
  }

  return resolveCs2FaceitElo(player);
}

export async function recordFaceitEloSnapshot(params: {
  gameAccountId: string;
  faceitPlayerId: string;
  matchId?: string | null;
}) {
  const elo = await fetchCurrentFaceitElo(params.faceitPlayerId);
  if (elo === null) {
    return false;
  }

  await db.transaction(async (tx) => {
    await recordEloSnapshotInTx(tx, {
      gameAccountId: params.gameAccountId,
      elo,
      matchId: params.matchId ?? null,
    });
  });

  return true;
}

export async function ensureFaceitEloBaseline(params: {
  gameAccountId: string;
  faceitPlayerId: string;
  currentElo?: number | null;
}) {
  const [existing] = await db
    .select({ id: eloHistory.id })
    .from(eloHistory)
    .where(eq(eloHistory.gameAccountId, params.gameAccountId))
    .limit(1);

  if (existing) {
    return;
  }

  const elo =
    params.currentElo !== null &&
    params.currentElo !== undefined &&
    params.currentElo > 0
      ? params.currentElo
      : await fetchCurrentFaceitElo(params.faceitPlayerId);

  if (elo === null) {
    return;
  }

  await db.transaction(async (tx) => {
    await recordEloSnapshotInTx(tx, {
      gameAccountId: params.gameAccountId,
      elo,
      matchId: null,
    });
  });
}
