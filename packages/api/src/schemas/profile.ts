import z from "zod";

export const updateProfileInputSchema = z.object({
  bio: z.string().max(500).nullable().optional(),
  favoriteGameId: z.string().nullable().optional(),
  region: z.string().max(32).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
