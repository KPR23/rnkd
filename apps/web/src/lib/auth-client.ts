import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
});

export const signInWithGithub = async () => {
	await authClient.signIn.social({
		provider: "github",
	});
};

export const { signIn, signUp, useSession } = createAuthClient();
