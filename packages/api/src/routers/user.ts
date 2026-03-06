import { db, user } from "@repo/db";
import { protectedProcedure, router } from "../trpc";
import { getAccountByRiotId } from "../services/riot";

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(({ ctx }) => {
		// ctx.session.user
		return getAccountByRiotId("Nick Bajer", "kacpi");
	}),
	getUsers: protectedProcedure.query(async () => {
		const users = await db.select().from(user);
		return users;
	}),
});
