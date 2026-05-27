import { Text, View } from "react-native";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

export default function ProfileRecentMatchCard({
  row,
}: {
  row: Cs2FaceitMatchHistoryRow;
}) {
  const { matches, cs2_faceit_match_players: player } = row;
  const win = player.win;
  const t1 = matches.team1Score;
  const t2 = matches.team2Score;
  const ours = player.team === 1 ? t1 : t2;
  const theirs = player.team === 1 ? t2 : t1;
  const scoreColor = win ? colors.success : colors.destructive;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);

  return (
    <View className="bg-card border-muted flex-1 overflow-hidden border">
      <View className="bg-muted h-24 w-full" />
      <View className="flex flex-col px-3.5 py-2.5">
        <AppText
          className="text-base tabular-nums"
          weight="medium"
          color={scoreColor}
        >
          {ours} - {theirs}
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
