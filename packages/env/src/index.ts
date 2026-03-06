import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.url(
			"DATABASE_URL must be a valid URL (e.g., starting with postgresql:// or neon://)",
		),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),
		OAUTH_GITHUB_CLIENT_ID: z.string(),
		OAUTH_GITHUB_CLIENT_SECRET: z.string(),
	},

	clientPrefix: "EXPO_PUBLIC_",
	client: {
		// EXPO_PUBLIC_API_URL: z.string().url()
	},

	runtimeEnv: {
		...process.env,
		DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
	},

	emptyStringAsUndefined: true,

	onValidationError: (error) => {
		console.error("ENV VALIDATION ERROR:", error);
		throw error;
	},
});
