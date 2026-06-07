import { Text, View } from "react-native";

import type { FaceitLevelProgress } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FaceitLevelBadge from "@/src/components/faceit/FaceitLevelBadge";

type FaceitLevelProgressProps = {
  nickname: string;
  levelProgress: FaceitLevelProgress;
};

export default function FaceitLevelProgressCard({
  nickname,
  levelProgress,
}: FaceitLevelProgressProps) {
  const span =
    levelProgress.levelEnd !== null
      ? levelProgress.levelEnd - levelProgress.levelStart
      : 1;
  const progressWithinLevel = Math.min(
    1,
    Math.max(0, (levelProgress.points - levelProgress.levelStart) / span),
  );

  return (
    <View className="border-muted bg-card flex flex-col gap-4 border px-4 py-3">
      <View className="flex flex-row items-center gap-4">
        <FaceitLevelBadge level={levelProgress.level} size={52} />
        <View className="min-w-0 flex-1 flex-col items-center gap-1">
          <View className="flex w-full flex-row items-baseline justify-between gap-1">
            <AppText className="text-sm" weight="medium">
              {nickname}
            </AppText>
            <AppText className="text-xl" weight="medium">
              {levelProgress.points}
            </AppText>
          </View>
          <View className="bg-muted h-1.5 w-full overflow-hidden">
            <View
              className="h-full"
              style={{
                width: `${progressWithinLevel * 100}%`,
                backgroundColor: colors.faceitBranding,
              }}
            />
          </View>
          <View className="flex w-full flex-row items-center justify-between gap-1">
            <AppText className="text-xs" color={colors.textSecondary}>
              {levelProgress.levelStart}
            </AppText>
            {levelProgress.pointsToNextLevel !== null &&
            levelProgress.levelEnd !== null ? (
              <AppText className="text-xs" color={colors.textSecondary}>
                +{levelProgress.pointsToNextLevel} to Level{" "}
                {levelProgress.level + 1}
              </AppText>
            ) : null}
            <AppText className="text-xs" color={colors.textSecondary}>
              {levelProgress.levelEnd}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
