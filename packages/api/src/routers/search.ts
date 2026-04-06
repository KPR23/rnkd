import z from "zod";
import { searchUsers } from "../services/search/users";
import { protectedProcedure, router } from "../trpc";

export const searchRouter = router({
	searchUsers: protectedProcedure.input(z.string()).query(async ({ input }) => {
		const results = await searchUsers(input);
		return results;
	}),
});
