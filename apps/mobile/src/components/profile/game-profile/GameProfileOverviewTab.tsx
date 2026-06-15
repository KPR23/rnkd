import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import type {
  Cs2FaceitGameAccount,
  Cs2FaceitMatchHistoryRow,
  FaceitLevelProgress,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FaceitSkillRankSection from "@/src/components/profile/game-profile/FaceitSkillRankSection";
import GameProfileHeaderCard from "@/src/components/profile/game-profile/GameProfileHeaderCard";
import GameProfileMatchHistoryCard from "@/src/components/profile/game-profile/GameProfileMatchHistoryCard";
import MatchDetailsModal from "@/src/components/profile/game-profile/MatchDetailsModal";
import GameProfileMetricsSection from "@/src/components/profile/game-profile/GameProfileMetricsSection";
import GameProfileSectionTitle from "@/src/components/profile/game-profile/GameProfileSectionTitle";

type DisplayData = {
  primaryRanked: { skillLevel: number | null; faceitElo: number | null } | null;
  levelProgress: FaceitLevelProgress | null;
  allTimeMetrics: {
    totalMatches: number;
    winRate: number | null;
    avgKd: number | null;
    eloPeak: number | null;
  };
};

export default function GameProfileOverviewTab({
  gameAccount,
  display,
  matchHistory,
  isDisplayLoading,
  isMatchHistoryLoading,
}: {
  gameAccount: Cs2FaceitGameAccount;
  display: DisplayData | undefined;
  matchHistory: Cs2FaceitMatchHistoryRow[] | undefined;
  isDisplayLoading: boolean;
  isMatchHistoryLoading: boolean;
}) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  return (
    <>
    <View className="flex flex-col gap-5">
      <GameProfileHeaderCard
        gameAccount={gameAccount}
        skillLevel={display?.primaryRanked?.skillLevel ?? null}
      />

      <GameProfileMetricsSection
        metrics={display?.allTimeMetrics}
        isLoading={isDisplayLoading}
      />

      <FaceitSkillRankSection levelProgress={display?.levelProgress} />

      <View className="flex flex-col gap-2">
        <GameProfileSectionTitle title="Match history" />
        {isMatchHistoryLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : matchHistory && matchHistory.length > 0 ? (
          <View className="flex flex-col gap-2">
            {matchHistory.map((row) => (
              <GameProfileMatchHistoryCard
                key={row.matches.id}
                row={row}
                onPress={() => setSelectedMatchId(row.matches.id)}
              />
            ))}
          </View>
        ) : (
          <View className="border-muted bg-card border px-3.5 py-4">
            <AppText color={colors.textSecondary}>No matches yet.</AppText>
          </View>
        )}
      </View>
    </View>

    <MatchDetailsModal
      visible={!!selectedMatchId}
      matchId={selectedMatchId}
      gameAccountId={gameAccount.id}
      onClose={() => setSelectedMatchId(null)}
    />
    </>
  );
}
