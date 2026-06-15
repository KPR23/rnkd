import { userIdSchema } from "../schemas/common";
import { updateProfileInputSchema } from "../schemas/profile";
import { getMatchActivity } from "../services/profile/activity";
import {
  getProfileOverview,
  updateProfile,
} from "../services/profile/overview";
import { protectedProcedure, router } from "../trpc";

export const profileRouter = router({
  getOverview: protectedProcedure
    .input(userIdSchema)
    .query(({ input }) => getProfileOverview(input.userId)),
  update: protectedProcedure
    .input(updateProfileInputSchema)
    .mutation(({ ctx, input }) => updateProfile(ctx.session.user.id, input)),
  getMatchActivity: protectedProcedure
    .input(userIdSchema)
    .query(({ input }) => getMatchActivity(input.userId)),
});
