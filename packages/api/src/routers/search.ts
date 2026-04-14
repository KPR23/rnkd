import z from "zod";

import { searchAll } from "../services/search/all";
import { searchUsers } from "../services/search/users";
import { protectedProcedure, router } from "../trpc";

export const searchRouter = router({
  searchUsers: protectedProcedure.input(z.string()).query(async ({ input }) => {
    const results = await searchUsers(input);
    return results;
  }),
  searchAll: protectedProcedure.input(z.string()).query(async ({ input }) => {
    const results = await searchAll(input);
    return results;
  }),
});
