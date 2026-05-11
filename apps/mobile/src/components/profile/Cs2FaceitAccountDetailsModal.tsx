import { ActivityIndicator, Image, Text, View } from "react-native";

import { Cs2FaceitGameAccount } from "@repo/types";
import Button from "@/src/components/Button";
import FaceitDisplayCard from "@/src/components/FaceitDisplayCard";
import Frame from "@/src/components/Frame";
import FaceitMatchHistoryCard from "@/src/components/profile/FaceitMatchHistoryCard";
import { useLinkedAccountRefresh } from "@/src/lib/hooks/useLinkedAccountRefresh";
import { trpc } from "@/src/utils/trpc";

export default function Cs2FaceitAccountDetailsModal({
  gameAccount,
}: {
  gameAccount: Cs2FaceitGameAccount;
}) {
  const { data: display, isLoading: isDisplayLoading } =
    trpc.gameAccount.getCs2FaceitProfileDisplay.useQuery({
      gameAccountId: gameAccount.id,
    });
  const {
    data: matchHistory,
    isLoading: isMatchHistoryLoading,
  } = trpc.gameAccount.getCs2FaceitMatchHistory.useQuery({
    gameAccountId: gameAccount.id,
  });

  const { refresh, isRefreshing } = useLinkedAccountRefresh(
    gameAccount.userId,
  );

  const faceitNick =
    gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
  const steamNick = gameAccount.profile?.steamNickname?.trim();
  const avatarUri = gameAccount.profile?.avatar?.trim();

  const faceitRecent = display?.recentRecord;
  const faceitWrLine =
    faceitRecent !== null &&
    faceitRecent !== undefined &&
    faceitRecent.played > 0
      ? `${faceitRecent.winRate.toFixed(0)}%`
      : isDisplayLoading
        ? "…"
        : "—";

  const overviewAccountLabel =
    gameAccount.profile?.faceitNickname?.trim() ??
    gameAccount.externalId.slice(0, 10);

  const secondaryLine = isDisplayLoading
    ? "…"
    : [
        display?.primaryRanked?.skillLevel != null
          ? `Level ${display.primaryRanked.skillLevel}`
          : null,
        display?.primaryRanked?.faceitElo != null
          ? `${display.primaryRanked.faceitElo} ELO`
          : null,
      ]
        .filter(Boolean)
        .join(" • ") || "Unranked";

  return (
    <View className="flex flex-col gap-4">
      <Frame className="flex flex-col items-start justify-center gap-4!">
        <View className="flex flex-row items-center justify-start gap-3">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <View className="bg-border flex h-12 w-12 items-center justify-center rounded-full">
              <Text className="font-mono-semibold text-text-muted text-[11px] uppercase">
                {faceitNick.slice(0, 2)}
              </Text>
            </View>
          )}
          <View className="min-w-0 flex-1 flex-col">
            <Text
              className="text-text font-sans-semibold text-xl"
              numberOfLines={1}
            >
              {faceitNick}
            </Text>
            {steamNick ? (
              <Text
                className="text-text-muted font-sans-medium text-sm"
                numberOfLines={1}
              >
                {steamNick}
              </Text>
            ) : null}
            <View className="mt-0.5 flex flex-row flex-wrap items-center gap-1">
              <Text
                className="text-text-muted font-sans-medium text-sm"
                numberOfLines={2}
              >
                {secondaryLine}
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
          Overview
        </Text>
        <FaceitDisplayCard
          skillLevel={display?.primaryRanked?.skillLevel ?? null}
          faceitElo={display?.primaryRanked?.faceitElo ?? null}
          accountLabel={overviewAccountLabel}
          recentWinRateLine={faceitWrLine}
          recentRecord={
            faceitRecent && faceitRecent.played > 0
              ? {
                  wins: faceitRecent.wins,
                  losses: faceitRecent.losses,
                }
              : null
          }
          isLoading={isDisplayLoading}
        />
      </View>
      <View className="flex w-full flex-col gap-2">
        <Text className="font-sans-semibold text-text-muted text-[11px] uppercase">
          Match history
        </Text>
        <View className="flex flex-col gap-2">
          {isMatchHistoryLoading ? (
            <ActivityIndicator />
          ) : (
            matchHistory?.map((row) => (
              <FaceitMatchHistoryCard key={row.matches.id} row={row} />
            ))
          )}
        </View>
      </View>
    </View>
  );
}
