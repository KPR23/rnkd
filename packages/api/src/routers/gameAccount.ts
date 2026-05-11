import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import {
  cs2FaceitGameAccountProfiles,
  cs2FaceitMatchPlayers,
  cs2FaceitRankedEntries,
  db,
  gameAccounts,
  GAMES,
  lolGameAccountProfiles,
  lolRankedEntries,
  matches,
  matchParticipants,
} from "@repo/db";
import {
  isCs2FaceitGameAccount,
  isLolGameAccount,
  RIOT_REGIONAL_ROUTE,
  type Cs2FaceitMatchHistoryRow,
  type GameAccount,
  type RiotPlatformRoute,
  type RiotRegionalRoute,
} from "@repo/types";

import { getFaceitPlayer } from "../services/faceit/faceit-client";
import { syncLatestFaceitMatchForAccount } from "../services/faceit/faceit-latest-match-sync";
import { persistFaceitSnapshotInTx } from "../services/faceit/faceit-profile-persist";
import { isValidPlatformRoute } from "../services/riot/helper";
import { syncLatestLolMatchForAccount } from "../services/riot/lol-latest-match-sync";
import { syncLolForAccount } from "../services/riot/lol-sync-runner";
import {
  getAccountByRiotId,
  getLolAccountDetails,
  getLolActiveRegionByPuuid,
  getLolLeagueEntriesByPuuid,
} from "../services/riot/riot-client";
import { protectedProcedure, router } from "../trpc";

const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);

const isGameAccountUniqueViolation = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
  };

  const code = err.code ?? err.cause?.code;
  const constraint = err.constraint ?? err.cause?.constraint;

  if (constraint === "game_accounts_game_external_unique") return true;
  if (code === "23505") return true;

  return false;
};

const LOL_PROFILE_REFRESH_TTL_MS = 1000 * 60 * 30;

type GameAccountRecord = typeof gameAccounts.$inferSelect & {
  lolProfile: typeof lolGameAccountProfiles.$inferSelect | null;
  cs2FaceitProfile: typeof cs2FaceitGameAccountProfiles.$inferSelect | null;
};

function getEpochMs(
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

function mapGameAccountRecord(account: GameAccountRecord): GameAccount {
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

function refreshLolAccountDataInBackground(
  accountId: string,
  externalId: string,
  platformRoute: RiotPlatformRoute,
) {
  void (async () => {
    try {
      const details = await getLolAccountDetails(externalId, platformRoute);
      let entries: Awaited<
        ReturnType<typeof getLolLeagueEntriesByPuuid>
      > | null = null;

      try {
        entries = await getLolLeagueEntriesByPuuid(externalId, platformRoute);
      } catch (error) {
        console.error("Failed to refresh LoL ranked entries", {
          accountId,
          error,
        });
      }

      await db.transaction(async (tx) => {
        const syncedAt = new Date();

        await tx
          .update(lolGameAccountProfiles)
          .set({
            profileIconId: details.profileIconId,
            summonerLevel: details.summonerLevel,
          })
          .where(eq(lolGameAccountProfiles.gameAccountId, accountId));

        await tx
          .update(gameAccounts)
          .set({
            lastSyncedAt: syncedAt,
          })
          .where(eq(gameAccounts.id, accountId));

        if (!entries) {
          return;
        }

        await tx
          .delete(lolRankedEntries)
          .where(
            and(
              eq(lolRankedEntries.gameAccountId, accountId),
              eq(lolRankedEntries.gameId, GAMES.LOL),
            ),
          );

        if (entries.length === 0) {
          return;
        }

        await tx.insert(lolRankedEntries).values(
          entries.map((entry) => ({
            gameAccountId: accountId,
            gameId: GAMES.LOL,
            queueType: entry.queueType,
            tier: entry.tier,
            rank: entry.rank || null,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            hotStreak: entry.hotStreak,
            inactive: entry.inactive,
            syncedAt,
          })),
        );
      });
    } catch (error) {
      console.error(error);
    }
  })();
}

const RANKED_SOLO = "RANKED_SOLO_5x5";
const RANKED_FLEX = "RANKED_FLEX_SR";

function pickPrimaryLolRankedEntry<T extends { queueType: string }>(
  rows: T[],
): T | null {
  if (rows.length === 0) {
    return null;
  }

  return (
    rows.find((row) => row.queueType === RANKED_SOLO) ??
    rows.find((row) => row.queueType === RANKED_FLEX) ??
    rows[0] ??
    null
  );
}

async function getNormalizedGameAccountsForUserId(
  userId: string,
  options: { refreshStaleLolProfiles: boolean },
) {
  let accounts: GameAccountRecord[] = [];
  try {
    accounts = await db.query.gameAccounts.findMany({
      where: eq(gameAccounts.userId, userId),
      with: {
        lolProfile: true,
        cs2FaceitProfile: true,
      },
    });
  } catch (error) {
    console.error("Failed to load game accounts for user", {
      userId,
      error,
    });
    throw error;
  }

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

export const gameAccountRouter = router({
  getGameAccounts: protectedProcedure.query(async ({ ctx }) => {
    return getNormalizedGameAccountsForUserId(ctx.session.user.id, {
      refreshStaleLolProfiles: true,
    });
  }),
  getGameAccountsByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return getNormalizedGameAccountsForUserId(input.userId, {
        refreshStaleLolProfiles: input.userId === ctx.session.user.id,
      });
    }),
  syncMyTrackedLatestMatches: protectedProcedure.mutation(async ({ ctx }) => {
    const POLL_MS = 175;

    const accounts = await db.query.gameAccounts.findMany({
      where: and(
        eq(gameAccounts.userId, ctx.session.user.id),
        eq(gameAccounts.isTracked, true),
      ),
      columns: { id: true, gameId: true },
    });

    const errors: { gameAccountId: string; message: string }[] = [];
    let lolAccounts = 0;
    let faceitAccounts = 0;

    const bumpDelay = async () => {
      await new Promise((r) => setTimeout(r, POLL_MS));
    };

    for (const acc of accounts) {
      if (acc.gameId === GAMES.LOL) {
        lolAccounts += 1;
        try {
          const result = await syncLatestLolMatchForAccount(acc.id);
          if (!result.ok) {
            errors.push({ gameAccountId: acc.id, message: result.error });
          }
        } catch (error) {
          errors.push({
            gameAccountId: acc.id,
            message: error instanceof Error ? error.message : String(error),
          });
        }
        await bumpDelay();
      } else if (acc.gameId === GAMES.CS2_FACEIT) {
        faceitAccounts += 1;
        try {
          const result = await syncLatestFaceitMatchForAccount(acc.id);
          if (!result.ok) {
            errors.push({ gameAccountId: acc.id, message: result.error });
          }
        } catch (error) {
          errors.push({
            gameAccountId: acc.id,
            message: error instanceof Error ? error.message : String(error),
          });
        }
        await bumpDelay();
      }
    }

    return { lolAccounts, faceitAccounts, errors };
  }),
  refreshTrackedGameAccountMatches: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const acc = await db.query.gameAccounts.findFirst({
        where: eq(gameAccounts.id, input.gameAccountId),
      });

      if (!acc) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (acc.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (!acc.isTracked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account is not tracked",
        });
      }

      if (acc.gameId === GAMES.LOL) {
        const result = await syncLatestLolMatchForAccount(acc.id);
        if (!result.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error,
          });
        }
        return { ok: true as const };
      }

      if (acc.gameId === GAMES.CS2_FACEIT) {
        const result = await syncLatestFaceitMatchForAccount(acc.id);
        if (!result.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error,
          });
        }
        return { ok: true as const };
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unsupported game for match refresh",
      });
    }),
  getLolProfileDisplay: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .query(async ({ input }) => {
      const accountRecord = await db.query.gameAccounts.findFirst({
        where: eq(gameAccounts.id, input.gameAccountId),
        with: {
          lolProfile: true,
          cs2FaceitProfile: true,
        },
      });

      if (!accountRecord) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const account = mapGameAccountRecord(accountRecord);

      if (!isLolGameAccount(account)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a League of Legends account",
        });
      }

      const rankedRows = await db.query.lolRankedEntries.findMany({
        where: eq(lolRankedEntries.gameAccountId, input.gameAccountId),
      });

      const perfRows = await db
        .select({
          kills: matchParticipants.kills,
          deaths: matchParticipants.deaths,
          assists: matchParticipants.assists,
          totalMinionsKilled: matchParticipants.totalMinionsKilled,
          team: matchParticipants.team,
          team1Score: matches.team1Score,
          team2Score: matches.team2Score,
          durationSeconds: matches.durationSeconds,
        })
        .from(matchParticipants)
        .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
        .where(
          and(
            eq(matchParticipants.gameAccountId, input.gameAccountId),
            eq(matches.gameId, GAMES.LOL),
          ),
        )
        .orderBy(desc(matches.playedAt))
        .limit(20);

      const primaryRanked = pickPrimaryLolRankedEntry(rankedRows);

      const rankedSoloDuo =
        rankedRows.find((row) => row.queueType === RANKED_SOLO) ?? null;
      const rankedFlex =
        rankedRows.find((row) => row.queueType === RANKED_FLEX) ?? null;

      let rankedWinRate = 0;
      if (primaryRanked) {
        const played = primaryRanked.wins + primaryRanked.losses;
        rankedWinRate = played > 0 ? (primaryRanked.wins / played) * 100 : 0;
      }

      const kdaValues: number[] = [];
      const csPerMinValues: number[] = [];
      const kpValues: number[] = [];

      for (const row of perfRows) {
        kdaValues.push((row.kills + row.assists) / Math.max(1, row.deaths));

        const durationMinutes =
          row.durationSeconds && row.durationSeconds > 0
            ? row.durationSeconds / 60
            : null;
        if (
          durationMinutes &&
          row.totalMinionsKilled !== null &&
          row.totalMinionsKilled !== undefined
        ) {
          csPerMinValues.push(row.totalMinionsKilled / durationMinutes);
        }

        const teamKills = row.team === 100 ? row.team1Score : row.team2Score;
        if (teamKills > 0) {
          kpValues.push(((row.kills + row.assists) / teamKills) * 100);
        }
      }

      const average = (values: number[]) =>
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : null;

      return {
        gameAccount: account,
        ranked: primaryRanked,
        rankedSoloDuo,
        rankedFlex,
        rankedWinRate,
        recentPerformance: {
          avgKda: average(kdaValues),
          avgCsPerMin: average(csPerMinValues),
          kpPercent: average(kpValues),
        },
      };
    }),
  getCs2FaceitProfileDisplay: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .query(async ({ input, ctx }) => {
      const accountRecord = await db.query.gameAccounts.findFirst({
        where: eq(gameAccounts.id, input.gameAccountId),
        with: {
          lolProfile: true,
          cs2FaceitProfile: true,
        },
      });

      if (!accountRecord) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (accountRecord.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const account = mapGameAccountRecord(accountRecord);

      if (!isCs2FaceitGameAccount(account)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a CS2 (FACEIT) account",
        });
      }

      const rankedRows = await db.query.cs2FaceitRankedEntries.findMany({
        where: eq(cs2FaceitRankedEntries.gameAccountId, input.gameAccountId),
      });

      const primaryRanked =
        rankedRows.find((row) => row.gameKey === "cs2") ??
        rankedRows[0] ??
        null;

      const perfRows = await db
        .select({
          kills: cs2FaceitMatchPlayers.kills,
          deaths: cs2FaceitMatchPlayers.deaths,
          adr: cs2FaceitMatchPlayers.adr,
          headshotPct: cs2FaceitMatchPlayers.headshotPct,
          win: cs2FaceitMatchPlayers.win,
        })
        .from(cs2FaceitMatchPlayers)
        .innerJoin(matches, eq(cs2FaceitMatchPlayers.matchId, matches.id))
        .where(
          and(
            eq(cs2FaceitMatchPlayers.gameAccountId, input.gameAccountId),
            eq(matches.gameId, GAMES.CS2_FACEIT),
          ),
        )
        .orderBy(desc(matches.playedAt))
        .limit(20);

      const kdRatios: number[] = [];
      let hsSum = 0;
      let hsCount = 0;
      let adrSum = 0;
      let adrCount = 0;
      let recentWins = 0;

      for (const row of perfRows) {
        if (row.win === true) {
          recentWins += 1;
        }
        const kills = row.kills ?? null;
        const deaths = row.deaths ?? null;
        if (
          kills !== null &&
          deaths !== null &&
          typeof kills === "number" &&
          typeof deaths === "number"
        ) {
          kdRatios.push(deaths > 0 ? kills / deaths : kills);
        }

        if (
          typeof row.headshotPct === "number" &&
          Number.isFinite(row.headshotPct)
        ) {
          hsSum += row.headshotPct;
          hsCount += 1;
        }

        if (typeof row.adr === "number" && Number.isFinite(row.adr)) {
          adrSum += row.adr;
          adrCount += 1;
        }
      }

      const avgKd =
        kdRatios.length > 0
          ? kdRatios.reduce((s, x) => s + x, 0) / kdRatios.length
          : null;
      const avgHsPct = hsCount > 0 ? hsSum / hsCount : null;
      const avgAdr = adrCount > 0 ? adrSum / adrCount : null;

      const recentPlayed = perfRows.length;
      const recentLosses = recentPlayed > 0 ? recentPlayed - recentWins : 0;
      let recentWinRate: number | null = null;
      if (recentPlayed > 0) {
        recentWinRate = (recentWins / recentPlayed) * 100;
      }

      return {
        gameAccount: account,
        primaryRanked,
        recentRecord:
          recentPlayed > 0
            ? {
                wins: recentWins,
                losses: recentLosses,
                played: recentPlayed,
                winRate: recentWinRate ?? 0,
              }
            : null,
        recentPerformance: {
          avgKd,
          avgHsPct,
          avgAdr,
        },
      };
    }),
  getCs2FaceitMatchHistory: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .query(async ({ input }) => {
      const [gameAccount] = await db
        .select()
        .from(gameAccounts)
        .where(
          and(
            eq(gameAccounts.id, input.gameAccountId),
            eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
          ),
        );

      if (!gameAccount) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const joined = await db
        .select()
        .from(matches)
        .innerJoin(
          cs2FaceitMatchPlayers,
          eq(matches.id, cs2FaceitMatchPlayers.matchId),
        )
        .where(
          and(
            eq(matches.gameId, GAMES.CS2_FACEIT),
            eq(cs2FaceitMatchPlayers.gameAccountId, gameAccount.id),
          ),
        )
        .orderBy(desc(matches.playedAt))
        .limit(40);

      return joined.map((row): Cs2FaceitMatchHistoryRow => {
        const r = row as Record<string, unknown>;
        const m = r.matches;
        const p = r.cs2_faceit_match_players ?? r.cs2FaceitMatchPlayers;
        if (
          typeof m !== "object" ||
          m === null ||
          typeof p !== "object" ||
          p === null
        ) {
          throw new Error("Unexpected CS2 FACEIT match history row shape");
        }
        return {
          matches: m as Cs2FaceitMatchHistoryRow["matches"],
          cs2_faceit_match_players:
            p as Cs2FaceitMatchHistoryRow["cs2_faceit_match_players"],
        };
      });
    }),
  getLolDetailsDemo: protectedProcedure
    .input(
      z.object({
        puuid: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { puuid } = input;

      const existingAccount = await db.query.gameAccounts.findFirst({
        where: and(
          eq(gameAccounts.gameId, GAMES.LOL),
          eq(gameAccounts.externalId, puuid),
        ),
      });

      if (!existingAccount) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const matchesSynced = await syncLolForAccount(existingAccount.id, 5);

      return { success: true, matchesSynced };
    }),
  addLolAccount: protectedProcedure
    .input(
      z.object({
        gameName: z.string().min(3, "Game name min. 3 characters").max(16),
        tagLine: z.string().min(3, "Tag line min. 3 characters").max(5),
        region: riotRegionalRouteSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const riotAccount = await getAccountByRiotId(
        input.gameName,
        input.tagLine,
        input.region,
      );

      const existingAccount = await db.query.gameAccounts.findFirst({
        where: and(
          eq(gameAccounts.gameId, GAMES.LOL),
          eq(gameAccounts.externalId, riotAccount.puuid),
        ),
      });

      if (existingAccount) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const activeRegion = await getLolActiveRegionByPuuid(
        riotAccount.puuid,
        input.region,
      );

      if (!isValidPlatformRoute(activeRegion)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Unsupported platform region: ${activeRegion}`,
        });
      }

      const details = await getLolAccountDetails(
        riotAccount.puuid,
        activeRegion,
      );
      const entries = await getLolLeagueEntriesByPuuid(
        riotAccount.puuid,
        activeRegion,
      );
      const syncedAt = new Date();

      try {
        const createdAccount = await db.transaction(async (tx) => {
          const [gameAccount] = await tx
            .insert(gameAccounts)
            .values({
              id: crypto.randomUUID(),
              userId: ctx.session.user.id,
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
              regionalRoute: input.region as RiotRegionalRoute,
              platformRoute: activeRegion as RiotPlatformRoute,
            })
            .returning();

          if (!lolProfile) {
            throw new Error("Failed to create LoL account profile");
          }

          if (entries.length > 0) {
            await tx.insert(lolRankedEntries).values(
              entries.map((entry) => ({
                gameAccountId: gameAccount.id,
                gameId: GAMES.LOL,
                queueType: entry.queueType,
                tier: entry.tier,
                rank: entry.rank || null,
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses,
                hotStreak: entry.hotStreak,
                inactive: entry.inactive,
                syncedAt,
              })),
            );
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

        return createdAccount;
      } catch (error) {
        if (isGameAccountUniqueViolation(error)) {
          throw new TRPCError({ code: "CONFLICT" });
        }

        throw error;
      }
    }),
  addFaceitAccount: protectedProcedure
    .input(
      z.object({
        externalId: z.string().min(1, "Faceit ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const player = await getFaceitPlayer(input.externalId);

        if (!player) {
          throw new Error("Failed to get Faceit player");
        }

        const syncedAt = new Date();

        const createdAccountRecord = await db.transaction(async (tx) => {
          const [gameAccount] = await tx
            .insert(gameAccounts)
            .values({
              id: crypto.randomUUID(),
              userId: ctx.session.user.id,
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
              where: eq(
                cs2FaceitGameAccountProfiles.gameAccountId,
                gameAccount.id,
              ),
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

        return createdAccountRecord;
      } catch (error) {
        if (isGameAccountUniqueViolation(error)) {
          throw new TRPCError({ code: "CONFLICT" });
        }

        throw error;
      }
    }),
  unlinkLolAccount: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const gameAccount = await tx.query.gameAccounts.findFirst({
          where: and(
            eq(gameAccounts.id, input.gameAccountId),
            eq(gameAccounts.gameId, GAMES.LOL),
            eq(gameAccounts.userId, ctx.session.user.id),
          ),
          with: {
            lolProfile: true,
          },
        });

        if (!gameAccount || !gameAccount.lolProfile) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await tx
          .delete(gameAccounts)
          .where(
            and(
              eq(gameAccounts.id, input.gameAccountId),
              eq(gameAccounts.gameId, GAMES.LOL),
              eq(gameAccounts.userId, ctx.session.user.id),
            ),
          );

        return { success: true };
      });
    }),
  unlinkCS2FaceitAccount: protectedProcedure
    .input(z.object({ gameAccountId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const gameAccount = await tx.query.gameAccounts.findFirst({
          where: and(
            eq(gameAccounts.id, input.gameAccountId),
            eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
            eq(gameAccounts.userId, ctx.session.user.id),
          ),
          with: {
            cs2FaceitProfile: true,
          },
        });

        if (!gameAccount || !gameAccount.cs2FaceitProfile) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await tx
          .delete(gameAccounts)
          .where(
            and(
              eq(gameAccounts.id, input.gameAccountId),
              eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
              eq(gameAccounts.userId, ctx.session.user.id),
            ),
          );

        return { success: true };
      });
    }),
});
