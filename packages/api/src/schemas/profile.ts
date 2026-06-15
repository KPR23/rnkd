import z from "zod";

const profileTagSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@+/, ""))
  .pipe(
    z
      .string()
      .min(2, "Nickname must be at least 2 characters")
      .max(32, "Nickname must be 32 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Nickname can only contain letters, numbers, and underscores",
      ),
  );

export const updateProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Name must be 64 characters or fewer")
    .optional(),
  tag: profileTagSchema.nullable().optional(),
  image: z
    .string()
    .trim()
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
      "Image must be a valid URL or path",
    )
    .nullable()
    .optional(),
  bio: z.string().max(500).nullable().optional(),
  favoriteGameId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional(),
  region: z.string().max(32).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
