import { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Stack, useLocalSearchParams } from "expo-router";

import type { User } from "@repo/types";
import ProfileScreen from "@/src/components/profile/ProfileScreen";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

function toProfileUser(u: {
  id: string;
  name: string;
  tag: string | null;
  image: string | null;
}): User {
  return {
    ...u,
    email: "",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useAuth();
  const { showError } = useMessage();
  const utils = trpc.useUtils();
  const syncPull = trpc.gameAccount.syncMyTrackedLatestMatches.useMutation();

  const {
    data: publicUser,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = trpc.user.getPublicById.useQuery({ id: id ?? "" }, { enabled: !!id });

  const {
    data: gameAccounts,
    isLoading: isLoadingAccounts,
    refetch: refetchGameAccounts,
    isFetching: gameAccountsFetching,
  } = trpc.gameAccount.getGameAccountsByUserId.useQuery(
    { userId: id ?? "" },
    { enabled: !!id },
  );

  const isOwnRoute = !!(session?.user?.id && id && session.user.id === id);

  const handlePullRefresh = useCallback(async () => {
    try {
      if (isOwnRoute) {
        await syncPull.mutateAsync();
      }
      await utils.gameAccount.invalidate();
      await refetchGameAccounts();
    } catch (error) {
      console.error("Player profile pull-to-refresh failed", error);
      const message =
        error instanceof Error ? error.message : "Could not refresh profile.";
      showError(message);
    }
  }, [refetchGameAccounts, isOwnRoute, showError, syncPull, utils.gameAccount]);

  if (!id) {
    return null;
  }

  if (isLoadingUser || isLoadingAccounts) {
    return (
      <>
        <Stack.Screen options={{ title: "Player" }} />
        <View className="bg-background flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (isUserError || !publicUser) {
    return (
      <>
        <Stack.Screen options={{ title: "Player" }} />
        <Screen safeAreaEdges={["bottom", "left", "right"]}>
          <Text className="text-text text-center font-sans">
            Player not found.
          </Text>
        </Screen>
      </>
    );
  }

  const isOwnProfile = session?.user.id === publicUser.id;

  return (
    <Screen safeAreaEdges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: "Player" }} />
      <ProfileScreen
        user={toProfileUser(publicUser)}
        isOwnProfile={isOwnProfile}
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
