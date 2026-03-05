import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000`,
	plugins: [
		expoClient({
			scheme: "mobile",
			storagePrefix: "mobile",
			storage: SecureStore,
		}),
	],
});
