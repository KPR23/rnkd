const fallbackServerUrl = "https://rnkd-web.vercel.app";

export const mobileServerUrl = (
	process.env.EXPO_PUBLIC_SERVER_URL ?? fallbackServerUrl
).replace(/\/$/, "");

export const mobileTrpcUrl = `${mobileServerUrl}/api/trpc`;
