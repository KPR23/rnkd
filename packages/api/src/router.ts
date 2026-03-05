import { db, user } from "@repo/db";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
	getUsers: publicProcedure.query(async () => {
		const users = await db.select().from(user);
		return users;
	}),
});

export type AppRouter = typeof appRouter;
