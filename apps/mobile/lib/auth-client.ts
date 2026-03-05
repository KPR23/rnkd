import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: "https://rnkd-web.vercel.app",
	plugins: [
		expoClient({
			scheme: "mobile",
			storagePrefix: "mobile",
			storage: SecureStore as any,
			disableCache: true,
		}),
	],
});
