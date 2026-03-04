import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z
			.string()
			.url(
				"DATABASE_URL must be a valid URL (e.g., starting with postgresql:// or neon://)",
			),
	},

	clientPrefix: "EXPO_PUBLIC_",
	client: {
		// EXPO_PUBLIC_API_URL: z.string().url()
	},

	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
});
