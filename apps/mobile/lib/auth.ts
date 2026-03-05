import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { env } from "../../../packages/env/src";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [
		"mobile://",
		"mobile://*",
		"https://rnkd-web.vercel.app",
		"http://localhost:3000",
	],
	plugins: [expo()],
	socialProviders: {
		github: {
			clientId: env.OAUTH_GITHUB_CLIENT_ID,
			clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET,
		},
	},
});
