import { Image, View } from "react-native";

import { CrownSimpleIcon } from "phosphor-react-native";

import type { Cs2FaceitMatchDetailsPlayer } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import {
  MATCH_DETAILS_KD_WIDTH,
  MATCH_DETAILS_KDA_WIDTH,
  MATCH_DETAILS_STAT_GAP,
} from "@/src/components/profile/game-profile/matchDetailsTableLayout";
import {
  formatMatchKd,
  formatMatchKda,
  formatSkillLevelLabel,
} from "@/src/lib/helper/matchStats";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";

function PlayerAvatar({
  nickname,
  avatar,
}: {
  nickname: string;
  avatar: string | null;
}) {
  if (avatar) {
    return (
      <Image source={{ uri: avatar }} className="h-9 w-9 rounded-full" />
    );
  }

  return (
    <View className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
      <AppText className="text-[11px] uppercase" weight="medium">
        {getInitialsForFallbackPhoto(nickname)}
      </AppText>
    </View>
  );
}

function StatColumns({
  player,
}: {
  player: Cs2FaceitMatchDetailsPlayer;
}) {
  return (
    <View
      className="shrink-0 flex-row items-center"
      style={{ gap: MATCH_DETAILS_STAT_GAP }}
    >
      <AppText
        className="text-[13px] tabular-nums"
        numberOfLines={1}
        style={{ width: MATCH_DETAILS_KD_WIDTH, textAlign: "right" }}
      >
        {formatMatchKd(player.kills, player.deaths)}
      </AppText>
      <AppText
        className="text-[13px] tabular-nums"
        numberOfLines={1}
        style={{ width: MATCH_DETAILS_KDA_WIDTH, textAlign: "right" }}
      >
        {formatMatchKda(player.kills, player.deaths, player.assists)}
      </AppText>
    </View>
  );
}

export default function MatchDetailsPlayerRow({
  player,
}: {
  player: Cs2FaceitMatchDetailsPlayer;
}) {
  const displayName = player.isViewer
    ? `${player.nickname} (You)`
    : player.nickname;

  return (
    <View
      className={`flex-row items-center px-4 py-4 ${
        player.isViewer ? "bg-muted/40" : ""
      }`}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-3">
        <PlayerAvatar nickname={player.nickname} avatar={player.avatar} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1">
            <AppText className="text-sm" weight="medium" numberOfLines={1}>
              {displayName}
            </AppText>
            {player.isCaptain ? (
              <CrownSimpleIcon
                size={player.isViewer ? 18 : 16}
                color={colors.text}
              />
            ) : null}
          </View>
          <AppText className="text-xs" color={colors.textSecondary}>
            {formatSkillLevelLabel(player.skillLevel)}
          </AppText>
        </View>
      </View>
      <StatColumns player={player} />
    </View>
  );
}
