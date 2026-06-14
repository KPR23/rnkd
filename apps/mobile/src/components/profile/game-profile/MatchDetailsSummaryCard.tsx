import { Image, View } from "react-native";

import type {
  Cs2FaceitMatchDetails,
  Cs2FaceitMatchDetailsTeam,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { getCs2MapImageUrl } from "@/src/lib/helper/cs2Map";
import { formatMatchDetailsDateTime } from "@/src/lib/helper/matchDetailsTime";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";

const HERO_HEIGHT = 120;
const TEAM_AVATAR_SIZE = 44;
const SCORE_BLOCK_WIDTH = 120;

function TeamAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: TEAM_AVATAR_SIZE, height: TEAM_AVATAR_SIZE }}
        className="rounded-full"
      />
    );
  }

  return (
    <View
      className="bg-muted items-center justify-center rounded-full"
      style={{ width: TEAM_AVATAR_SIZE, height: TEAM_AVATAR_SIZE }}
    >
      <AppText className="text-xs uppercase" weight="medium">
        {getInitialsForFallbackPhoto(name)}
      </AppText>
    </View>
  );
}

function TeamScoreColumn({ team }: { team: Cs2FaceitMatchDetailsTeam }) {
  return (
    <View className="min-w-0 flex-1 items-center gap-1.5 px-1">
      <TeamAvatar name={team.name} avatar={team.avatar} />
      <AppText
        className="w-full text-center text-sm leading-5"
        weight="medium"
        numberOfLines={2}
      >
        {team.name}
      </AppText>
    </View>
  );
}

export default function MatchDetailsSummaryCard({
  details,
}: {
  details: Cs2FaceitMatchDetails;
}) {
  const { summary, teams } = details;
  const [leftTeam, rightTeam] = teams;
  const mapImageUrl = getCs2MapImageUrl(summary.mapName);
  const playedAt =
    summary.playedAt instanceof Date
      ? summary.playedAt
      : new Date(summary.playedAt);

  const leftScoreColor = leftTeam.won ? colors.success : colors.destructive;
  const rightScoreColor = rightTeam.won ? colors.success : colors.destructive;

  return (
    <View className="border-muted bg-card overflow-hidden border">
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
            <View className="bg-card/60 absolute inset-0" />
          </>
        ) : (
          <View className="bg-muted w-full" style={{ height: HERO_HEIGHT }} />
        )}
      </View>

      <View className="border-muted border-t px-3.5 pt-6 pb-3.5">
        <View className="flex-row items-start">
          <TeamScoreColumn team={leftTeam} />

          <View
            className="items-center justify-center gap-0.5 self-center"
            style={{ width: SCORE_BLOCK_WIDTH }}
          >
            <View className="flex-row items-center justify-center gap-2.5">
              <AppText
                className="text-[28px] tabular-nums"
                weight="medium"
                color={leftScoreColor}
              >
                {leftTeam.score}
              </AppText>
              <AppText className="text-xl" color={colors.textSecondary}>
                -
              </AppText>
              <AppText
                className="text-[28px] tabular-nums"
                weight="medium"
                color={rightScoreColor}
              >
                {rightTeam.score}
              </AppText>
            </View>
            {summary.matchTypeLabel ? (
              <AppText
                className="text-center text-[13px]"
                color={colors.textSecondary}
                numberOfLines={2}
              >
                {summary.matchTypeLabel}
              </AppText>
            ) : null}
          </View>

          <TeamScoreColumn team={rightTeam} />
        </View>

        <View className="bg-muted mt-4 mb-3 h-px w-full" />

        <View className="gap-1">
          <View className="flex-row items-center justify-between gap-3">
            <AppText
              className="min-w-0 flex-1 text-base leading-4.5"
              weight="medium"
              numberOfLines={1}
            >
              {summary.mapLabel}
            </AppText>
            <AppText
              className="shrink-0 text-right text-base leading-4.5"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {summary.serverLabel ?? "—"}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <AppText
              className="min-w-0 flex-1 text-[13px] leading-4"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {summary.queueLabel}
            </AppText>
            <AppText
              className="shrink-0 text-right text-[13px] leading-4 tabular-nums"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {formatMatchDetailsDateTime(playedAt)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
