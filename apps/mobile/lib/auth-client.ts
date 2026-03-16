import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { mobileServerUrl } from "./server-url";
import type { auth } from "../../web/src/lib/auth";

export const authClient = createAuthClient({
	baseURL: mobileServerUrl,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		expoClient({
			scheme: "mobile",
			storagePrefix: "mobile",
			storage: SecureStore,
			disableCache: true,
		}),
	],
});
