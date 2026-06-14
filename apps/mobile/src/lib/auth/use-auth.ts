import { authClient } from "./auth-client";

export function useAuth() {
  return authClient.useSession();
}

export async function refetchAuthSession() {
  await authClient.getSession({
    query: {
      disableCookieCache: true,
    },
  });
  authClient.$store.notify("$sessionSignal");
}
