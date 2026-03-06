import { TRPCError, initTRPC } from "@trpc/server";
import type { BetterAuthSession } from "@repo/auth-types";
import superjson from "superjson";

export type TRPCContext = {
	session: BetterAuthSession | null;
};

export const createTRPCContext = (opts: TRPCContext): TRPCContext => opts;

const t = initTRPC.context<TRPCContext>().create({
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
