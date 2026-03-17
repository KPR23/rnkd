import { mobileServerUrl } from "@/lib/server-url";
import { expoClient } from "@better-auth/expo/client";
import type { auth } from "@repo/types";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: mobileServerUrl,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		expoClient({
			scheme: "rnkd",
			storagePrefix: "mobile",
			storage: SecureStore,
			disableCache: true,
		}),
	],
});
