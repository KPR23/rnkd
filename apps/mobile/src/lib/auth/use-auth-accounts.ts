import { useCallback, useEffect, useState } from "react";

import { authClient } from "@/src/lib/auth/auth-client";

export type AuthLinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
};

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  google: "Google",
};

export function getAuthProviderLabel(providerId: string) {
  return PROVIDER_LABELS[providerId] ?? providerId;
}

export function useAuthAccounts() {
  const [accounts, setAccounts] = useState<AuthLinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.listAccounts();

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to load social accounts");
      }

      setAccounts(
        (result.data ?? []).map((account) => ({
          id: account.id,
          providerId: account.providerId,
          accountId: account.accountId,
        })),
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load social accounts";
      setError(message);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    error,
    isLoading,
    reload: loadAccounts,
    getProviderLabel: getAuthProviderLabel,
  };
}
