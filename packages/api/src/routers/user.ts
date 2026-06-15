import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { db, user } from "@repo/db";

import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
  getPublicById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const row = await db.query.user.findFirst({
        where: eq(user.id, input.id),
      });

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: row.id,
        name: row.name,
        tag: row.tag,
        image: row.image,
        bio: row.bio,
        region: row.region,
        globalRs: row.globalRs,
      };
    }),
});
