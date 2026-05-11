import { Text, View } from "react-native";

import FaceitLevelBadge from "@/src/components/faceit/FaceitLevelBadge";

export type FaceitDisplayCardProps = {
  skillLevel?: number | null;
  faceitElo?: number | null;
  accountLabel: string;
  recentWinRateLine: string;
  recentRecord: { wins: number; losses: number } | null;
  isLoading?: boolean;
};

export default function FaceitDisplayCard({
  skillLevel,
  faceitElo,
  accountLabel,
  recentWinRateLine,
  recentRecord,
  isLoading,
}: FaceitDisplayCardProps) {
  const hasLevel =
    skillLevel !== null &&
    skillLevel !== undefined &&
    !Number.isNaN(skillLevel);
  const hasElo =
    faceitElo !== null && faceitElo !== undefined && !Number.isNaN(faceitElo);
  const showRecord =
    recentRecord !== null && recentRecord.wins + recentRecord.losses > 0;

  return (
    <View className="border-border bg-card flex h-16 w-full flex-row items-center justify-between border px-4 py-2">
      <View className="flex flex-1 flex-row items-center gap-3">
        <View className="flex h-12 w-12 shrink-0 items-center justify-center">
          {isLoading ? (
            <View className="bg-border h-10 w-10 rounded opacity-60" />
          ) : (
            <FaceitLevelBadge level={hasLevel ? skillLevel : 1} size={48} />
          )}
        </View>
        <View className="w-full flex-1 flex-col">
          <View className="flex w-full flex-row items-center justify-between gap-1">
            <View className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-1">
              {isLoading ? (
                <Text className="font-sans-semibold text-text text-base">
                  …
                </Text>
              ) : hasLevel || hasElo ? (
                <>
                  {hasLevel ? (
                    <>
                      <Text className="font-sans-semibold text-text text-base">
                        Level {skillLevel}
                        {hasElo ? " " : ""}
                      </Text>
                      {hasElo ? (
                        <Text className="font-sans-semibold text-text-muted text-base">
                          {faceitElo} ELO
                        </Text>
                      ) : null}
                    </>
                  ) : hasElo ? (
                    <>
                      <Text className="font-sans-semibold text-text text-base">
                        {faceitElo}{" "}
                      </Text>
                      <Text className="font-sans-semibold text-text-muted text-base">
                        ELO
                      </Text>
                    </>
                  ) : null}
                </>
              ) : (
                <Text className="font-sans-semibold text-text text-base">
                  Unranked
                </Text>
              )}
            </View>
            {showRecord && (
              <View className="flex shrink-0 flex-row items-center gap-1">
                <Text className="font-mono-medium text-text text-xs uppercase">
                  {recentRecord.wins}
                  <Text className="font-sans-medium text-text text-xs uppercase">
                    W
                  </Text>
                </Text>
                <Text className="font-mono-medium text-text text-xs uppercase">
                  {recentRecord.losses}
                  <Text className="font-sans-medium text-text text-xs uppercase">
                    L
                  </Text>
                </Text>
              </View>
            )}
          </View>
          <View className="flex w-full flex-row items-center justify-between gap-1">
            <Text
              className="font-sans-medium text-text-secondary text-xs"
              numberOfLines={1}
            >
              {accountLabel}
            </Text>
            {showRecord && (
              <View className="flex shrink-0 flex-row items-center gap-1">
                <Text className="font-mono-semibold text-text-muted text-xs uppercase">
                  {recentWinRateLine}
                </Text>
                <Text className="font-sans-medium text-text-muted text-xs uppercase">
                  WR
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
