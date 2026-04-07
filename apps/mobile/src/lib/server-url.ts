const configuredServerUrl = process.env.EXPO_PUBLIC_SERVER_URL?.replace(
	/\/+$/,
	"",
);

if (!configuredServerUrl) {
	throw new Error("EXPO_PUBLIC_SERVER_URL must be set for the mobile app");
}

export const mobileServerUrl = configuredServerUrl;
export const mobileTrpcUrl = `${mobileServerUrl}/api/trpc`;
