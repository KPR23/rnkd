import { useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

import type { LolGameAccount, LolMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import GameProfileMetricCard from "@/src/components/profile/game-profile/GameProfileMetricCard";
import LolGameProfileMatchHistoryCard from "@/src/components/profile/game-profile/LolGameProfileMatchHistoryCard";
import LolMatchDetailsModal from "@/src/components/profile/game-profile/LolMatchDetailsModal";
import GameProfileSectionTitle from "@/src/components/profile/game-profile/GameProfileSectionTitle";
import RankDisplayCard, {
  type RankDisplayRanked,
} from "@/src/components/RankDisplayCard";
import { DRAGON_CDN_VERSION } from "@/src/lib/constants/riotApiUrl";

type LolRanked = RankDisplayRanked;

type LolDisplayData = {
  ranked: LolRanked;
  rankedSoloDuo: LolRanked;
  rankedFlex: LolRanked;
  recentPerformance: {
    avgKda: number | null;
    avgCsPerMin: number | null;
    kpPercent: number | null;
  };
};

function formatWinRateLine(ranked: LolRanked | undefined, isLoading: boolean) {
  if (!ranked) {
    return isLoading ? "…" : "—";
  }

  const played = (ranked.wins ?? 0) + (ranked.losses ?? 0);
  if (played === 0) {
    return "—";
  }

  return `${(((ranked.wins ?? 0) / played) * 100).toFixed(0)}%`;
}

function formatMetric(
  value: number | null | undefined,
  formatter: (n: number) => string,
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatter(value);
}

export default function LolGameProfileOverviewTab({
  gameAccount,
  display,
  matchHistory,
  isDisplayLoading,
  isMatchHistoryLoading,
  isFetchingNextPage,
  hasNextPage,
}: {
  gameAccount: LolGameAccount;
  display: LolDisplayData | undefined;
  matchHistory: LolMatchHistoryRow[] | undefined;
  isDisplayLoading: boolean;
  isMatchHistoryLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
}) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`;
  const loadingValue = isDisplayLoading ? "…" : "—";

  return (
    <>
    <View className="flex flex-col gap-5">
      <View className="border-muted bg-card flex-row items-center border px-5 py-4">
        <View className="min-w-0 flex-1 flex-row items-center gap-4">
          <Image source={{ uri: profileIconUrl }} className="h-14 w-14" />
          <View className="min-w-0 flex-1 flex-col justify-center">
            <View className="min-w-0 flex-row items-baseline gap-1">
              <AppText className="text-xl" weight="medium" numberOfLines={1}>
                {gameAccount.profile.gameName}
              </AppText>
              <AppText
                className="text-base"
                color={colors.textSecondary}
                numberOfLines={1}
              >
                #{gameAccount.profile.tagLine}
              </AppText>
            </View>
            <AppText
              className="text-sm"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              Level {gameAccount.profile.summonerLevel ?? 0} ·{" "}
              {gameAccount.profile.platformRoute.toUpperCase()}
            </AppText>
          </View>
        </View>
      </View>

      <View className="flex flex-col gap-2">
        <GameProfileSectionTitle title="Ranked" />
        <View className="flex flex-col gap-2">
          <RankDisplayCard
            ranked={display?.rankedSoloDuo}
            accountLabel="Ranked Solo/Duo"
            winRateLine={formatWinRateLine(
              display?.rankedSoloDuo,
              isDisplayLoading,
            )}
          />
          <RankDisplayCard
            ranked={display?.rankedFlex}
            accountLabel="Ranked Flex"
            winRateLine={formatWinRateLine(display?.rankedFlex, isDisplayLoading)}
          />
        </View>
      </View>

      <View className="flex flex-col gap-2">
        <GameProfileSectionTitle title="Recent metrics" />
        <View className="flex flex-row gap-2.5">
          <GameProfileMetricCard
            label="Avg KDA"
            value={
              isDisplayLoading
                ? loadingValue
                : formatMetric(display?.recentPerformance.avgKda, (n) =>
                    n.toFixed(2),
                  )
            }
          />
          <GameProfileMetricCard
            label="Avg CS/min"
            value={
              isDisplayLoading
                ? loadingValue
                : formatMetric(display?.recentPerformance.avgCsPerMin, (n) =>
                    n.toFixed(1),
                  )
            }
          />
          <GameProfileMetricCard
            label="KP"
            value={
              isDisplayLoading
                ? loadingValue
                : formatMetric(display?.recentPerformance.kpPercent, (n) =>
                    `${n.toFixed(0)}%`,
                  )
            }
          />
        </View>
      </View>

      <View className="flex flex-col gap-2">
        <GameProfileSectionTitle title="Match history" />
        {isMatchHistoryLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : matchHistory && matchHistory.length > 0 ? (
          <View className="flex flex-col gap-2">
            {matchHistory.map((row) => (
              <LolGameProfileMatchHistoryCard
                key={row.matches.id}
                row={row}
                onPress={() => setSelectedMatchId(row.matches.id)}
              />
            ))}
            {isFetchingNextPage ? (
              <View className="py-2">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
            {!hasNextPage && matchHistory.length > 0 ? (
              <View className="items-center py-2">
                <AppText className="text-xs" color={colors.textSecondary}>
                  All matches loaded.
                </AppText>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="border-muted bg-card border px-3.5 py-4">
            <AppText color={colors.textSecondary}>No matches yet.</AppText>
          </View>
        )}
      </View>
    </View>

    <LolMatchDetailsModal
      visible={!!selectedMatchId}
      matchId={selectedMatchId}
      gameAccountId={gameAccount.id}
      onClose={() => setSelectedMatchId(null)}
    />
    </>
  );
}
