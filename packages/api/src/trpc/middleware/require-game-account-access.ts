import { TRPCError } from "@trpc/server";
import z from "zod";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import { t } from "../../trpc";

const gameAccountIdInputSchema = z.object({
  gameAccountId: z.uuid(),
});

export type GameAccountAccessPolicy = "public-read" | "owner";

export function requireGameAccountAccess(policy: GameAccountAccessPolicy) {
  return t.middleware(async ({ ctx, next, getRawInput }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const rawInput = await getRawInput();
    const parsed = gameAccountIdInputSchema.safeParse(rawInput);

    if (!parsed.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "gameAccountId is required",
      });
    }

    const account = await findGameAccountById(parsed.data.gameAccountId);

    if (
      !account ||
      (policy === "owner" && account.userId !== ctx.session.user.id)
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return next({
      ctx: {
        ...ctx,
        gameAccount: account,
      },
    });
  });
}
