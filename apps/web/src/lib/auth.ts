import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../../../packages/db/src";
import { env } from "../../../../packages/env/src";

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
	trustedOrigins:
		env.NODE_ENV === "development"
			? [
					"*", // allow all origins in dev to avoid CORS issues
				]
			: ["mobile://", "https://rnkd-web.vercel.app", "http://localhost:8081"],
	plugins: [expo()],
	socialProviders,
});
