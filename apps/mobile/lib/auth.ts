import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { env } from "../../../packages/env/src";

export const auth = betterAuth({
	trustedOrigins: [
		"mobile://",

		// Development mode - Expo's exp:// scheme with local IP ranges
		...(env.NODE_ENV === "development"
			? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
			: []),
	],
	plugins: [expo()],
	socialProviders: {
		github: {
			clientId: env.OAUTH_GITHUB_CLIENT_ID,
			clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET,
		},
	},
});
