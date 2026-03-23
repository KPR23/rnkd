import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(({ ctx }) => {
		return ctx.session.user;
	}),
});
