import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { mobileServerUrl } from "./server-url";

export const authClient = createAuthClient({
	baseURL: mobileServerUrl,
	plugins: [
		expoClient({
			scheme: "mobile",
			storagePrefix: "mobile",
			storage: SecureStore,
			disableCache: true,
		}),
	],
});
