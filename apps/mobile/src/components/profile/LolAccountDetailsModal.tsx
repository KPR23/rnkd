import { useCallback } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { LolGameAccount } from "@repo/types";
import Button from "@/src/components/Button";
import Frame from "@/src/components/Frame";
import LolMatchHistoryCard from "@/src/components/profile/LolMatchHistoryCard";
import RankDisplayCard from "@/src/components/RankDisplayCard";
import { DRAGON_CDN_VERSION } from "@/src/lib/constants/riotApiUrl";
import { useLinkedAccountRefresh } from "@/src/lib/hooks/useLinkedAccountRefresh";
import { trpc } from "@/src/utils/trpc";

function queueWinRateLine(
  ranked: { wins: number; losses: number } | null | undefined,
  isLoading: boolean,
) {
  if (ranked == null) {
    return isLoading ? "…" : "—";
  }
  const played = ranked.wins + ranked.losses;
  if (played === 0) {
    return "—";
  }
  return `${((ranked.wins / played) * 100).toFixed(0)}%`;
}

export default function LolAccountDetailsModal({
  gameAccount,
}: {
  gameAccount: LolGameAccount;
}) {
  const utils = trpc.useUtils();

  const lolRefetchLocal = useCallback(async () => {
    await Promise.all([
      utils.gameAccount.getLolProfileDisplay.refetch({
        gameAccountId: gameAccount.id,
      }),
      utils.riot.getMatchHistory.refetch({
        gameAccountId: gameAccount.id,
      }),
    ]);
  }, [gameAccount.id, utils]);

  const { data, isLoading } = trpc.gameAccount.getLolProfileDisplay.useQuery({
    gameAccountId: gameAccount.id,
  });
  const { data: matchHistory, isLoading: isMatchHistoryLoading } =
    trpc.riot.getMatchHistory.useQuery({
      gameAccountId: gameAccount.id,
    });

  const { refresh, isRefreshing } = useLinkedAccountRefresh(gameAccount.id, {
    refetchLocal: lolRefetchLocal,
  });

  const soloWr = queueWinRateLine(data?.rankedSoloDuo, isLoading);
  const flexWr = queueWinRateLine(data?.rankedFlex, isLoading);

  return (
    <View className="flex flex-col gap-4">
      <Frame className="flex flex-col items-start justify-center gap-4!">
        <View className="flex flex-row items-center justify-start gap-3">
          <Image
            source={{
              uri: `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`,
            }}
            className="h-12 w-12"
          />
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-1">
              <Text className="text-text font-sans-semibold text-xl">
                {gameAccount.profile.gameName}
              </Text>
              <Text className="text-text-muted font-sans-semibold text-lg">
                #{gameAccount.profile.tagLine}
              </Text>
            </View>
            <View className="flex flex-row items-center justify-start gap-1">
              <Text className="text-text-muted font-sans-medium text-sm">
                Level {gameAccount.profile.summonerLevel ?? "0"}
              </Text>
              <Text className="text-text-muted font-sans-medium text-sm">
                •
              </Text>
              <Text className="text-text-muted font-sans-medium text-sm">
                {/* TODO: Format regional route */}
                {gameAccount.profile.platformRoute === "eun1"
                  ? "EUNE"
                  : gameAccount.profile.platformRoute}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-full flex-row gap-3">
          <Button
            variant="primary"
            actionText="Refresh"
            className="h-9! flex-1"
            disabled={isRefreshing}
            onPress={() => void refresh()}
          />
        </View>
      </Frame>
      <View className="flex w-full flex-col gap-2">
        <Text className="font-sans-semibold text-text-muted text-[11px] uppercase">
          Ranked
        </Text>
        <View className="flex flex-col gap-2">
          <RankDisplayCard
            ranked={data?.rankedSoloDuo}
            accountLabel="Ranked Solo/Duo"
            winRateLine={soloWr}
          />
          <RankDisplayCard
            ranked={data?.rankedFlex}
            accountLabel="Ranked Flex"
            winRateLine={flexWr}
          />
        </View>
      </View>
      <View className="flex w-full flex-col gap-2">
        <Text className="font-sans-semibold text-text-muted text-[11px] uppercase">
          Match history
        </Text>
        <View className="flex flex-col gap-2">
          {isMatchHistoryLoading ? (
            <ActivityIndicator />
          ) : (
            matchHistory?.map((match) => (
              <LolMatchHistoryCard
                key={match.matches.id}
                matchHistory={match}
              />
            ))
          )}
        </View>
      </View>
    </View>
  );
}
