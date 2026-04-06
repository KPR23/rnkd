import z from "zod";
import {
	searchUsers,
	searchUsersByNameOrTag,
	searchUsersByTag,
} from "../services/search/users";
import { protectedProcedure, router } from "../trpc";

export const searchRouter = router({
	searchUsers: protectedProcedure.input(z.string()).query(async ({ input }) => {
		const results = await searchUsers(input);
		return results;
	}),
	searchUsersByTag: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const results = await searchUsersByTag(input);
			return results;
		}),
	searchUsersByName: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const results = await searchUsersByNameOrTag(input);
			return results;
		}),
});
