import { and, eq } from "drizzle-orm";
import z from "zod";

import { db, pushTokens } from "@repo/db";

import { protectedProcedure, router } from "../trpc";

const pushTokenInput = z.object({
  token: z.string().min(1),
  platform: z.string().min(1),
  deviceId: z.string().optional(),
});

export const notificationsRouter = router({
  registerPushToken: protectedProcedure
    .input(pushTokenInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await db
        .insert(pushTokens)
        .values({
          token: input.token,
          userId,
          platform: input.platform,
          deviceId: input.deviceId,
        })
        .onConflictDoUpdate({
          target: pushTokens.token,
          set: {
            userId,
            platform: input.platform,
            deviceId: input.deviceId,
            updatedAt: new Date(),
          },
        });

      return { ok: true as const };
    }),

  unregisterPushToken: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(pushTokens)
        .where(
          and(
            eq(pushTokens.token, input.token),
            eq(pushTokens.userId, ctx.session.user.id),
          ),
        );

      return { ok: true as const };
    }),
});
