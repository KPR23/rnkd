import { useCallback } from "react";

import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

export function useLinkedAccountRefresh(
  gameAccountUserId: string | null | undefined,
) {
  const { data: session } = useAuth();
  const utils = trpc.useUtils();
  const syncPull = trpc.gameAccount.syncMyTrackedLatestMatches.useMutation();

  const isOwn =
    !!session?.user?.id &&
    gameAccountUserId != null &&
    gameAccountUserId === session.user.id;

  const refresh = useCallback(async () => {
    try {
      if (isOwn) {
        await syncPull.mutateAsync();
      }
      await Promise.all([
        utils.gameAccount.invalidate(),
        utils.riot.invalidate(),
      ]);
    } catch (error) {
      console.error("Linked account refresh failed", error);
    }
  }, [isOwn, syncPull, utils.gameAccount, utils.riot]);

  return {
    refresh,
    isRefreshing: syncPull.isPending && isOwn,
  };
}
