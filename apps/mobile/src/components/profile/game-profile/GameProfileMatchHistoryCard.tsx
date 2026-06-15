import { Image, Pressable, StyleSheet, View } from "react-native";

import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { getCs2MapImageUrl } from "@/src/lib/helper/cs2Map";
import { formatMapDisplayName } from "@/src/lib/helper/formatMapName";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

const HERO_HEIGHT = 89;

function MatchHeroOverlay({ matchId, win }: { matchId: string; win: boolean }) {
  const outcomeColor = win ? colors.success : colors.destructive;
  const outcomeGradientId = `match-hero-outcome-${matchId}`;

  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={outcomeGradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop
            offset="0"
            stopColor={outcomeColor}
            stopOpacity={win ? "0.7" : "0.85"}
          />
          <Stop
            offset="0.25"
            stopColor={outcomeColor}
            stopOpacity={win ? "0.4" : "0.5"}
          />
          <Stop
            offset="0.5"
            stopColor={outcomeColor}
            stopOpacity={win ? "0.1" : "0.14"}
          />
          <Stop
            offset="0.75"
            stopColor={outcomeColor}
            stopOpacity={win ? "0.4" : "0.5"}
          />
          <Stop
            offset="1"
            stopColor={outcomeColor}
            stopOpacity={win ? "0.7" : "0.85"}
          />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${outcomeGradientId})`} />
    </Svg>
  );
}

function formatKd(
  kills: number | null | undefined,
  deaths: number | null | undefined,
): string {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined
  ) {
    return "— K/D";
  }
  const ratio = deaths > 0 ? kills / deaths : kills;
  return `${ratio.toFixed(2)} K/D`;
}

function formatKda(
  kills: number | null | undefined,
  deaths: number | null | undefined,
  assists: number | null | undefined,
): string {
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

export default function GameProfileMatchHistoryCard({
  row,
  onPress,
}: {
  row: Cs2FaceitMatchHistoryRow;
  onPress?: () => void;
}) {
  const { matches, cs2_faceit_match_players: player } = row;
  const win = player.win;
  const teamScores = [matches.team1Score, matches.team2Score];
  const ourScore = win ? Math.max(...teamScores) : Math.min(...teamScores);
  const theirScore = win ? Math.min(...teamScores) : Math.max(...teamScores);
  const outcomeLabel = win ? "Victory" : "Defeat";
  const outcomeColor = win ? colors.success : colors.destructive;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const mapImageUrl = getCs2MapImageUrl(matches.mapName);
  const mapLabel = formatMapDisplayName(matches.mapName);

  const content = (
    <View className="border-muted bg-card h-37.5 overflow-hidden border">
      <View
        className="relative w-full overflow-hidden"
        style={{ height: HERO_HEIGHT }}
      >
        {mapImageUrl ? (
          <>
            <Image
              source={{ uri: mapImageUrl }}
              style={{ height: HERO_HEIGHT, width: "100%" }}
              resizeMode="cover"
            />
            <View className="bg-card/75 absolute inset-0" />
          </>
        ) : (
          <View className="bg-muted w-full" style={{ height: HERO_HEIGHT }} />
        )}
        <MatchHeroOverlay matchId={matches.id} win={win} />
        <View className="absolute inset-0 items-center justify-center">
          <AppText className="text-[28px]" weight="medium">
            {ourScore} - {theirScore}
          </AppText>
          <AppText
            className="text-sm"
            color={colors.text}
            style={{ opacity: 0.6 }}
          >
            {mapLabel} · {formatProfileMatchTime(playedAt)}
          </AppText>
        </View>
      </View>

      <View className="border-muted flex-1 justify-center border-t px-3.5 py-3">
        <View className="flex-row items-center justify-between">
          <AppText
            className="text-base leading-[100%]"
            weight="medium"
            color={outcomeColor}
          >
            {outcomeLabel}
          </AppText>
          <AppText
            className="text-base leading-[100%] tabular-nums"
            weight="medium"
          >
            {formatKd(player.kills, player.deaths)}
          </AppText>
        </View>
        <View className="mt-0.5 flex-row items-center justify-between">
          <AppText
            className="text-[13px] leading-[100%]"
            color={colors.textSecondary}
          >
            Europe 5V5 Queue
          </AppText>
          <AppText
            className="text-[13px] leading-[100%] tabular-nums"
            color={colors.textSecondary}
          >
            K/D/A {formatKda(player.kills, player.deaths, player.assists)}
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
