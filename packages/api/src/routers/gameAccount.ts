import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { db, gameAccounts, GAMES } from "@repo/db";
import { env } from "@repo/env";
import type { Cs2FaceitMatchHistoryRow } from "@repo/types";

import { findGameAccountsByUserId } from "../repositories/game-accounts.repo";
import { gameAccountIdSchema, userIdSchema } from "../schemas/common";
import { riotRegionalRouteSchema } from "../schemas/riot";
import { syncLatestFaceitMatchForAccount } from "../services/faceit/faceit-latest-match-sync";
import {
  isGameAccountUniqueViolation,
  linkFaceitAccount,
  linkLolAccount,
  unlinkGameAccount,
} from "../services/game-account/link";
import { normalizeGameAccounts } from "../services/game-account/normalize";
import { getCs2FaceitProfileDisplay } from "../services/profile/faceit-display";
import { getLolProfileDisplay } from "../services/profile/lol-display";
import { syncLatestLolMatchForAccount } from "../services/riot/lol-latest-match-sync";
import { syncLolForAccount } from "../services/riot/lol-sync-runner";
import { getAccountByRiotId } from "../services/riot/riot-client";
import { getFaceitPlayer } from "../services/faceit/faceit-client";
import { syncTrackedAccountsForUser } from "../services/sync/sync-tracked-for-user";
import { protectedProcedure, router } from "../trpc";
import { requireGameAccountAccess } from "../trpc/middleware/require-game-account-access";

export const gameAccountRouter = router({
  getGameAccounts: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await findGameAccountsByUserId(ctx.session.user.id);
    return normalizeGameAccounts(accounts, {
      refreshStaleLolProfiles: true,
    });
  }),
  getGameAccountsByUserId: protectedProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      const accounts = await findGameAccountsByUserId(input.userId);
      return normalizeGameAccounts(accounts, {
        refreshStaleLolProfiles: input.userId === ctx.session.user.id,
      });
    }),
  syncMyTrackedLatestMatches: protectedProcedure.mutation(({ ctx }) =>
    syncTrackedAccountsForUser(ctx.session.user.id),
  ),
  refreshTrackedGameAccountMatches: protectedProcedure
    .input(gameAccountIdSchema)
    .use(requireGameAccountAccess("owner"))
    .mutation(async ({ ctx }) => {
      const acc = ctx.gameAccount!;

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
    .input(gameAccountIdSchema)
    .use(requireGameAccountAccess("public-read"))
    .query(({ input }) => getLolProfileDisplay(input.gameAccountId)),
  getCs2FaceitProfileDisplay: protectedProcedure
    .input(gameAccountIdSchema)
    .use(requireGameAccountAccess("public-read"))
    .query(({ input }) => getCs2FaceitProfileDisplay(input.gameAccountId)),
  getCs2FaceitMatchHistory: protectedProcedure
    .input(
      gameAccountIdSchema.extend({
        limit: z.number().int().min(1).max(100).default(40),
      }),
    )
    .use(requireGameAccountAccess("public-read"))
    .query(async ({ input }) => {
      const { getMatchHistoryForAccount } =
        await import("../services/match/history");
      const result = await getMatchHistoryForAccount({
        gameAccountId: input.gameAccountId,
        limit: input.limit,
      });

      if (result.gameId !== GAMES.CS2_FACEIT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a CS2 (FACEIT) account",
        });
      }

      return result.rows;
    }),
  getCs2FaceitMatchHistoryPage: protectedProcedure
    .input(
      gameAccountIdSchema.extend({
        limit: z.number().int().min(1).max(20).default(20),
        cursor: z
          .object({
            playedAt: z.date(),
            id: z.string().min(1),
          })
          .optional(),
      }),
    )
    .use(requireGameAccountAccess("public-read"))
    .query(async ({ input }) => {
      const { getMatchHistoryPageForAccount } =
        await import("../services/match/history");
      const result = await getMatchHistoryPageForAccount({
        gameAccountId: input.gameAccountId,
        limit: input.limit,
        cursor: input.cursor,
      });

      if (result.gameId !== GAMES.CS2_FACEIT) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not a CS2 (FACEIT) account",
        });
      }

      return {
        rows: result.rows as Cs2FaceitMatchHistoryRow[],
        nextCursor: result.nextCursor,
      };
    }),
  getLolDetailsDemo: protectedProcedure
    .input(z.object({ puuid: z.string() }))
    .query(async ({ ctx, input }) => {
      if (env.NODE_ENV !== "development") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const existingAccount = await db.query.gameAccounts.findFirst({
        where: and(
          eq(gameAccounts.gameId, GAMES.LOL),
          eq(gameAccounts.externalId, input.puuid),
        ),
      });

      if (!existingAccount) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingAccount.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const matchesSynced = await syncLolForAccount(existingAccount.id, 5);
      return { success: true, matchesSynced };
    }),
  previewLolAccount: protectedProcedure
    .input(
      z.object({
        gameName: z.string().min(3).max(16),
        tagLine: z.string().min(3).max(5),
        region: riotRegionalRouteSchema,
      }),
    )
    .query(async ({ input }) => {
      try {
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

        return {
          found: true as const,
          gameName: riotAccount.gameName,
          tagLine: riotAccount.tagLine,
          alreadyLinked: !!existingAccount,
        };
      } catch {
        return { found: false as const, alreadyLinked: false as const };
      }
    }),
  previewFaceitAccount: protectedProcedure
    .input(z.object({ nickname: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      const player = await getFaceitPlayer(input.nickname);

      if (!player) {
        return { found: false as const, alreadyLinked: false as const };
      }

      const existingAccount = await db.query.gameAccounts.findFirst({
        where: and(
          eq(gameAccounts.gameId, GAMES.CS2_FACEIT),
          eq(gameAccounts.externalId, player.player_id),
        ),
      });

      return {
        found: true as const,
        player,
        alreadyLinked: !!existingAccount,
      };
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
      try {
        const result = await linkLolAccount({
          userId: ctx.session.user.id,
          gameName: input.gameName,
          tagLine: input.tagLine,
          region: input.region,
        });

        if ("error" in result) {
          if (result.error === "CONFLICT") {
            throw new TRPCError({ code: "CONFLICT" });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Unsupported platform region: ${result.activeRegion}`,
          });
        }

        return result.account;
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
        return await linkFaceitAccount({
          userId: ctx.session.user.id,
          externalId: input.externalId,
        });
      } catch (error) {
        if (isGameAccountUniqueViolation(error)) {
          throw new TRPCError({ code: "CONFLICT" });
        }

        throw error;
      }
    }),
  unlinkLolAccount: protectedProcedure
    .input(gameAccountIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await unlinkGameAccount({
        userId: ctx.session.user.id,
        gameAccountId: input.gameAccountId,
        gameId: GAMES.LOL,
      });

      if ("error" in result) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result;
    }),
  unlinkCS2FaceitAccount: protectedProcedure
    .input(gameAccountIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await unlinkGameAccount({
        userId: ctx.session.user.id,
        gameAccountId: input.gameAccountId,
        gameId: GAMES.CS2_FACEIT,
      });

      if ("error" in result) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return result;
    }),
});
