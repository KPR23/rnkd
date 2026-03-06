import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import { env } from "@repo/env";

const socialProviders =
	env.OAUTH_GITHUB_CLIENT_ID && env.OAUTH_GITHUB_CLIENT_SECRET
		? {
				github: {
					clientId: env.OAUTH_GITHUB_CLIENT_ID,
					clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET,
				},
			}
		: {};

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	trustedOrigins: Array.from(
		new Set(
			env.NODE_ENV === "development"
				? [env.BETTER_AUTH_URL, "http://localhost:3000", "mobile://", "exp://"]
				: [env.BETTER_AUTH_URL, "mobile://"],
		),
	),
	plugins: [expo()],
	socialProviders,
});
