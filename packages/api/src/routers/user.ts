import { db, user } from "@repo/db";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(({ ctx }) => ctx.session.user),
	getUsers: protectedProcedure.query(async () => {
		const users = await db.select().from(user);
		return users;
	}),
});
