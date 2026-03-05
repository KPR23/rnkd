import { createAuthClient } from "better-auth/react";
import { env } from "../../../../packages/env/src";

export const authClient = createAuthClient({
	baseURL: env.BETTER_AUTH_URL,
});

export const signInWithGithub = async () => {
	await authClient.signIn.social({
		provider: "github",
	});
};

export const { signIn, signUp, useSession } = createAuthClient();
