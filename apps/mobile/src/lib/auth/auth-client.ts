import { expoClient } from "@better-auth/expo/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import type { auth } from "@repo/types";
import { mobileServerUrl } from "@/src/lib/server-url";

export const authClient = createAuthClient({
  baseURL: mobileServerUrl,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    expoClient({
      scheme: "rnkd",
      storagePrefix: "rnkd",
      storage: SecureStore,
      disableCache: true,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
