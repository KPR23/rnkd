import { Image, Pressable, StyleSheet, View } from "react-native";

import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import type { LolMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { getLolChampionSplashUrl } from "@/src/lib/helper/lolChampion";
import { formatLolQueueLabel } from "@/src/lib/helper/lolQueue";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

const HERO_HEIGHT = 110;

function MatchHeroOverlay({ matchId, win }: { matchId: string; win: boolean }) {
  const outcomeColor = win ? colors.success : colors.destructive;
  const outcomeGradientId = `lol-match-hero-outcome-${matchId}`;

  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={outcomeGradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={outcomeColor} stopOpacity="0.8" />
          <Stop offset="0.28" stopColor={outcomeColor} stopOpacity="0.38" />
          <Stop offset="0.5" stopColor={outcomeColor} stopOpacity="0.08" />
          <Stop offset="0.72" stopColor={outcomeColor} stopOpacity="0.38" />
          <Stop offset="1" stopColor={outcomeColor} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${outcomeGradientId})`} />
    </Svg>
  );
}

function formatKda(
  kills: number | null | undefined,
  deaths: number | null | undefined,
  assists: number | null | undefined,
) {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined ||
    assists === null ||
    assists === undefined
  ) {
    return "—";
  }

  return `${kills}/${deaths}/${assists}`;
}

function formatKdaRatio(
  kills: number | null | undefined,
  deaths: number | null | undefined,
  assists: number | null | undefined,
) {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined ||
    assists === null ||
    assists === undefined
  ) {
    return "— KDA";
  }

  const ratio = deaths > 0 ? (kills + assists) / deaths : kills + assists;
  return `${ratio.toFixed(2)} KDA`;
}

export default function LolGameProfileMatchHistoryCard({
  row,
  onPress,
}: {
  row: LolMatchHistoryRow;
  onPress?: () => void;
}) {
  const { matches, match_participants: player } = row;
  const win = player.win;
  const outcomeLabel = win ? "Victory" : "Defeat";
  const outcomeColor = win ? colors.success : colors.destructive;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const championSplashUrl = getLolChampionSplashUrl(player.championIconUrl);

  const content = (
    <View className="border-muted bg-card h-42 overflow-hidden border">
      <View
        className="bg-muted relative w-full overflow-hidden"
        style={{ height: HERO_HEIGHT }}
      >
        {championSplashUrl ? (
          <Image
            source={{ uri: championSplashUrl }}
            style={{ height: HERO_HEIGHT, width: "100%" }}
            resizeMode="cover"
          />
        ) : null}
        <View className="bg-card/70 absolute inset-0" />
        <MatchHeroOverlay matchId={matches.id} win={win} />
        <View className="absolute inset-0 items-center justify-center">
          <AppText className="text-[28px]" weight="medium" color={outcomeColor}>
            {outcomeLabel}
          </AppText>
          <AppText
            className="text-sm"
            color={colors.text}
            style={{ opacity: 0.68 }}
          >
            {player.championName} · {formatProfileMatchTime(playedAt)}
          </AppText>
        </View>
      </View>

      <View className="border-muted flex-1 justify-center border-t px-3.5 py-3">
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Image
              source={{ uri: player.championIconUrl }}
              className="h-8 w-8"
              resizeMode="cover"
            />
            <AppText
              className="min-w-0 flex-1 text-base leading-[100%]"
              weight="medium"
              numberOfLines={1}
            >
              {formatLolQueueLabel(matches.queueId)}
            </AppText>
          </View>
          <AppText
            className="text-base leading-[100%] tabular-nums"
            weight="medium"
          >
            {formatKdaRatio(player.kills, player.deaths, player.assists)}
          </AppText>
        </View>
        <View className="mt-0.5 flex-row items-center justify-between">
          <AppText
            className="text-[13px] leading-[100%]"
            color={colors.textSecondary}
          >
            K/D/A {formatKda(player.kills, player.deaths, player.assists)}
          </AppText>
          <AppText
            className="text-[13px] leading-[100%] tabular-nums"
            color={colors.textSecondary}
          >
            {player.totalMinionsKilled ?? "—"} CS
          </AppText>
        </View>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
