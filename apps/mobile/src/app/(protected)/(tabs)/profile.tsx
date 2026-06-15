import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";

import ProfileScreen from "@/src/components/profile/ProfileScreen";
import Screen from "@/src/components/Screen";
import { refetchAuthSession, useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

export default function ProfileTab() {
  const utils = trpc.useUtils();
  const syncPull = trpc.gameAccount.syncMyTrackedLatestMatches.useMutation();

  const { data: session, isPending } = useAuth();

  const {
    data: gameAccounts,
    refetch: refetchGameAccounts,
    isFetching: gameAccountsFetching,
  } = trpc.gameAccount.getGameAccounts.useQuery(undefined, {
    enabled: !!session,
  });

  const handlePullRefresh = useCallback(async () => {
    try {
      await syncPull.mutateAsync();
      await utils.gameAccount.invalidate();
      await utils.profile.invalidate();
      await refetchAuthSession();
      await refetchGameAccounts();
    } catch (error) {
      console.error("Profile pull-to-refresh failed", error);
    }
  }, [refetchGameAccounts, syncPull, utils.gameAccount, utils.profile]);

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Screen>
      <ProfileScreen
        user={session.user}
        isOwnProfile
        title="Profile"
        pullToRefresh={{
          refreshing: syncPull.isPending || gameAccountsFetching,
          onRefresh: handlePullRefresh,
        }}
        gameAccounts={[
          ...(gameAccounts?.lol ?? []),
          ...(gameAccounts?.faceit ?? []),
        ]}
      />
    </Screen>
  );
}
