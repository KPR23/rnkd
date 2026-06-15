import { Image, View } from "react-native";

import type { LolMatchHistoryRow } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { formatLolQueueLabel } from "@/src/lib/helper/lolQueue";
import { formatProfileMatchTime } from "@/src/lib/helper/profileTime";

const CHAMPION_IMAGE_HEIGHT = 120;

function getChampionSplashUrl(championIconUrl: string) {
  const championKey = championIconUrl.match(/\/champion\/([^/.]+)\.png$/)?.[1];

  if (!championKey) {
    return null;
  }

  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg`;
}

export default function LolProfileRecentMatchCard({
  row,
}: {
  row: LolMatchHistoryRow;
}) {
  const { matches, match_participants: player } = row;
  const playedAt =
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt);
  const resultColor = player.win ? colors.success : colors.destructive;
  const resultLabel = player.win ? "Victory" : "Defeat";
  const championSplashUrl = getChampionSplashUrl(player.championIconUrl);

  return (
    <View className="bg-card border-muted flex-1 overflow-hidden border">
      {championSplashUrl ? (
        <Image
          source={{ uri: championSplashUrl }}
          style={{ height: CHAMPION_IMAGE_HEIGHT, width: "100%" }}
          resizeMode="cover"
        />
      ) : null}
      <View className="flex flex-col px-3.5 py-2.5">
        <AppText
          className="text-base tabular-nums"
          weight="medium"
          color={resultColor}
        >
          {resultLabel}
        </AppText>
        <View className="flex flex-col gap-2">
          <AppText className="text-[13px]" color={colors.textSecondary}>
            {player.kills} / {player.deaths} / {player.assists}
          </AppText>
          <AppText className="text-[13px]" color={colors.textSecondary}>
            {formatLolQueueLabel(matches.queueId)}
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
