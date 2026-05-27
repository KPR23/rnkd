import { Image, View } from "react-native";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { getCs2MapImageUrl } from "@/src/lib/helper/cs2Map";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

export default function ProfileRecentMatchCard({
  row,
}: {
  row: Cs2FaceitMatchHistoryRow;
}) {
  const { matches, cs2_faceit_match_players: player } = row;
  const win = player.win;
  const teamScores = [matches.team1Score, matches.team2Score];
  const ourScore = win ? Math.max(...teamScores) : Math.min(...teamScores);
  const theirScore = win ? Math.min(...teamScores) : Math.max(...teamScores);
  const scoreColor = win ? colors.success : colors.destructive;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const mapImageUrl = getCs2MapImageUrl(matches.mapName);

  return (
    <View className="bg-card border-muted flex-1 overflow-hidden border">
      <View className="relative h-30 w-full">
        {mapImageUrl ? (
          <>
            <Image
              source={{ uri: mapImageUrl }}
              className="h-30 w-full"
              resizeMode="cover"
            />
            <View className="bg-card/20 absolute inset-0" />
          </>
        ) : (
          <View className="bg-muted h-30 w-full" />
        )}
      </View>
      <View className="flex flex-col px-3.5 py-2.5">
        <AppText
          className="text-base tabular-nums"
          weight="medium"
          color={scoreColor}
        >
          {ourScore} - {theirScore}
        </AppText>
        <View className="flex flex-col gap-2">
          <AppText className="text-[13px]" color={colors.textSecondary}>
            Europe 5V5 Queue
          </AppText>
          <View className="bg-muted h-px w-full" />
        </View>
        <View className="pt-1.5">
          <AppText className="text-xs" color={colors.textSecondary}>
            {formatProfileMatchTime(playedAt)}
          </AppText>
        </View>
      </View>
    </View>
  );
}
