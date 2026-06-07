import { Image, Pressable, View } from "react-native";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { getCs2MapImageUrl } from "@/src/lib/helper/cs2Map";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

const MAP_IMAGE_HEIGHT = 120;

export default function ProfileRecentMatchCard({
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
  const scoreColor = win ? colors.success : colors.destructive;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const mapImageUrl = getCs2MapImageUrl(matches.mapName);

  const content = (
    <View className="bg-card border-muted flex-1 overflow-hidden border">
      <View
        className="relative w-full overflow-hidden"
        style={{ height: MAP_IMAGE_HEIGHT }}
      >
        {mapImageUrl ? (
          <>
            <Image
              source={{ uri: mapImageUrl }}
              style={{ height: MAP_IMAGE_HEIGHT, width: "100%" }}
              resizeMode="cover"
            />
            <View className="bg-card/20 absolute inset-0" />
          </>
        ) : (
          <View
            className="bg-muted w-full"
            style={{ height: MAP_IMAGE_HEIGHT }}
          />
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

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-1">
      {content}
    </Pressable>
  );
}
