import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { BetterAuthSession } from "@repo/types";

import type { GameAccountRecord } from "./repositories/game-accounts.repo";

export type TRPCContext = {
  session: BetterAuthSession | null;
  gameAccount?: GameAccountRecord;
};

export const createTRPCContext = (opts: TRPCContext): TRPCContext => opts;

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
