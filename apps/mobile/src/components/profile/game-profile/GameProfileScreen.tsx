import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { GAMES, isCs2FaceitGameAccount } from "@repo/types";
import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import GameProfileOverviewTab from "@/src/components/profile/game-profile/GameProfileOverviewTab";
import GameProfileTabBar from "@/src/components/profile/game-profile/GameProfileTabBar";
import { trpc } from "@/src/utils/trpc";

export default function GameProfileScreen({
  gameAccountId,
}: {
  gameAccountId: string;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "stats">("overview");

  const {
    data: display,
    isLoading: isDisplayLoading,
    isError,
  } = trpc.gameAccount.getCs2FaceitProfileDisplay.useQuery({
    gameAccountId,
  });

  const { data: matchHistory, isLoading: isMatchHistoryLoading } =
    trpc.gameAccount.getCs2FaceitMatchHistory.useQuery({
      gameAccountId,
      limit: 40,
    });

  if (isDisplayLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !display?.gameAccount) {
    return (
      <Text className="text-text mt-4 text-center font-sans">
        Game profile not found.
      </Text>
    );
  }

  const gameAccount = display.gameAccount;

  if (
    gameAccount.gameId !== GAMES.CS2_FACEIT ||
    !isCs2FaceitGameAccount(gameAccount)
  ) {
    return (
      <Text className="text-text mt-4 text-center font-sans">
        This game profile is not available yet.
      </Text>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32, gap: 20 }}
    >
      <GameProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" ? (
        <GameProfileOverviewTab
          gameAccount={gameAccount}
          display={display}
          matchHistory={matchHistory as Cs2FaceitMatchHistoryRow[] | undefined}
          isDisplayLoading={isDisplayLoading}
          isMatchHistoryLoading={isMatchHistoryLoading}
        />
      ) : (
        <View className="border-muted bg-card border px-4 py-6">
          <AppText color={colors.textSecondary}>Stats coming soon.</AppText>
        </View>
      )}
    </ScrollView>
  );
}
