import { useCallback } from "react";

import { TRPCClientError } from "@trpc/client";

import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

export type UseLinkedAccountRefreshOptions = {
  /** Run after backend sync + router invalidates (explicit refetch for this screen’s queries). */
  refetchLocal?: () => Promise<void>;
};

export function useLinkedAccountRefresh(
  gameAccountId: string,
  options?: UseLinkedAccountRefreshOptions,
) {
  const refetchLocal = options?.refetchLocal;

  const { data: session } = useAuth();
  const utils = trpc.useUtils();
  const refreshOne = trpc.gameAccount.refreshTrackedGameAccountMatches.useMutation();

  const refresh = useCallback(async () => {
    try {
      if (session?.user?.id) {
        try {
          await refreshOne.mutateAsync({ gameAccountId });
        } catch (err) {
          if (
            err instanceof TRPCClientError &&
            err.data?.httpStatus === 403
          ) {
            /* Viewing someone else's linked account — server refuses sync. */
          } else {
            throw err;
          }
        }
      }
      await Promise.all([
        utils.gameAccount.invalidate(),
        utils.riot.invalidate(),
      ]);
      await refetchLocal?.();
    } catch (error) {
      console.error("Linked account refresh failed", error);
    }
  }, [gameAccountId, refreshOne, session?.user?.id, utils.gameAccount, utils.riot, refetchLocal]);

  return {
    refresh,
    isRefreshing: refreshOne.isPending,
  };
}
