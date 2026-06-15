import z from "zod";

export const gameAccountIdSchema = z.object({
  gameAccountId: z.uuid(),
});

export const userIdSchema = z.object({
  userId: z.string(),
});

export const matchHistoryInputSchema = gameAccountIdSchema.extend({
  limit: z.number().int().min(1).max(100).default(40),
});
