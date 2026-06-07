import { View } from "react-native";

import {
  getFaceitLevelWindow,
  type FaceitLevelProgress,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FaceitLevelBadge from "@/src/components/faceit/FaceitLevelBadge";
import GameProfileSectionTitle from "@/src/components/profile/game-profile/GameProfileSectionTitle";

function badgeSizeForLevel(currentLevel: number, level: number): number {
  const distance = Math.abs(currentLevel - level);
  if (distance === 0) return 36;
  if (distance === 1) return 32;
  return 28;
}

export default function FaceitSkillRankSection({
  levelProgress,
}: {
  levelProgress: FaceitLevelProgress | null | undefined;
}) {
  if (!levelProgress) {
    return (
      <View className="flex flex-col gap-2">
        <GameProfileSectionTitle title="Skill rank" />
        <View className="border-muted bg-card border px-6 py-3.5">
          <AppText color={colors.textSecondary}>Unranked</AppText>
        </View>
      </View>
    );
  }

  const levelWindow = getFaceitLevelWindow(levelProgress.level, 5);
  const span =
    levelProgress.levelEnd !== null
      ? levelProgress.levelEnd - levelProgress.levelStart
      : 1;
  const progressWithinLevel = Math.min(
    1,
    Math.max(0, (levelProgress.points - levelProgress.levelStart) / span),
  );
  const nextLevelLabel =
    levelProgress.pointsToNextLevel !== null && levelProgress.level < 10
      ? `+${levelProgress.pointsToNextLevel} to Level ${levelProgress.level + 1}`
      : null;

  return (
    <View className="flex flex-col gap-2">
      <GameProfileSectionTitle title="Skill rank" />
      <View className="border-muted bg-card flex flex-col border px-6 py-3.5">
        <View className="flex-row items-end justify-center gap-6 px-1">
          {levelWindow.map((threshold) => {
            const size = badgeSizeForLevel(
              levelProgress.level,
              threshold.level,
            );
            return (
              <View
                key={threshold.level}
                className="items-center justify-center gap-1"
              >
                <FaceitLevelBadge level={threshold.level} size={size} />
                <AppText
                  className="text-[11px]"
                  color={colors.textSecondary}
                  style={{
                    fontSize: threshold.level === levelProgress.level ? 13 : 11,
                  }}
                >
                  {threshold.min}
                </AppText>
              </View>
            );
          })}
        </View>

        <View className="mt-3 flex flex-col gap-1.5">
          <View className="bg-muted h-1 w-full overflow-hidden">
            <View
              className="h-full"
              style={{
                width: `${progressWithinLevel * 100}%`,
                backgroundColor: colors.faceitBranding,
              }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <AppText className="text-sm" weight="medium">
              {levelProgress.points} ELO
            </AppText>
            {nextLevelLabel ? (
              <AppText className="text-[13px]" color={colors.textSecondary}>
                {nextLevelLabel}
              </AppText>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
