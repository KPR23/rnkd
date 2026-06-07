import { Image, View } from "react-native";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { formatMapDisplayName } from "@/src/lib/helper/formatMapName";
import { getCs2MapImageUrl } from "@/src/lib/helper/cs2Map";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

const HERO_HEIGHT = 89;

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
}: {
  row: Cs2FaceitMatchHistoryRow;
}) {
  const { matches, cs2_faceit_match_players: player } = row;
  const win = player.win;
  const teamScores = [matches.team1Score, matches.team2Score];
  const ourScore = win ? Math.max(...teamScores) : Math.min(...teamScores);
  const theirScore = win ? Math.min(...teamScores) : Math.max(...teamScores);
  const outcomeLabel = win ? "Victory" : "Defeat";
  const outcomeColor = win ? colors.success : colors.destructive;
  const overlayColor = win
    ? "rgba(11, 217, 87, 0.55)"
    : "rgba(193, 37, 39, 0.75)";
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const mapImageUrl = getCs2MapImageUrl(matches.mapName);
  const mapLabel = formatMapDisplayName(matches.mapName);

  return (
    <View className="border-muted bg-card h-[151px] overflow-hidden border">
      <View className="relative w-full overflow-hidden" style={{ height: HERO_HEIGHT }}>
        {mapImageUrl ? (
          <>
            <Image
              source={{ uri: mapImageUrl }}
              style={{ height: HERO_HEIGHT, width: "100%" }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-card/80" />
          </>
        ) : (
          <View className="bg-muted w-full" style={{ height: HERO_HEIGHT }} />
        )}
        <View
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <AppText className="text-[28px] leading-8" weight="medium">
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
          <AppText className="text-base" weight="medium" color={outcomeColor}>
            {outcomeLabel}
          </AppText>
          <AppText className="text-base tabular-nums" weight="medium">
            {formatKd(player.kills, player.deaths)}
          </AppText>
        </View>
        <View className="mt-0.5 flex-row items-center justify-between">
          <AppText className="text-[13px]" color={colors.textSecondary}>
            Europe 5V5 Queue
          </AppText>
          <AppText className="text-[13px] tabular-nums" color={colors.textSecondary}>
            {formatKda(player.kills, player.deaths, player.assists)}
          </AppText>
        </View>
      </View>
    </View>
  );
}
