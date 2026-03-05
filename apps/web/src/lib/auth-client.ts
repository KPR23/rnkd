import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: "https://rnkd-web.vercel.app",
});

export const signInWithGithub = async () => {
	await authClient.signIn.social({
		provider: "github",
	});
};
export const { signIn, signUp, useSession } = authClient;
