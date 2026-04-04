import z from "zod";
import { protectedProcedure, router } from "../trpc";
import { searchUsers } from "../services/search/users";

export const searchRouter = router({
	searchQuery: protectedProcedure.input(z.string()).query(async ({ input }) => {
		const results = await searchUsers(input);
		return results;
	}),
});
