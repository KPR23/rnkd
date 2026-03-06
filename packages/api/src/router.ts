import { db, user } from "@repo/db";
import { protectedProcedure, router } from "./trpc";

export const appRouter = router({
	getUsers: protectedProcedure.query(async () => {
		const users = await db.select().from(user);
		return users;
	}),
	getCurrentUser: protectedProcedure.query(({ ctx }) => {
		return ctx.session.user;
	}),
});

export type AppRouter = typeof appRouter;
