import { Text, View } from "react-native";

import RankEmblem from "./Riot/RankEmblems";

function formatRankTitle(tier: string, rank: string | null) {
  const t = tier.charAt(0) + tier.slice(1).toLowerCase();
  if (!rank) {
    return t;
  }
  return `${t} ${rank}`;
}

function riotTierToEmblemTier(tier: string | undefined): string {
  if (!tier) {
    return "unranked";
  }

  const lower = tier.toLowerCase();
  const keys = [
    "iron",
    "bronze",
    "silver",
    "gold",
    "platinum",
    "emerald",
    "diamond",
    "master",
    "grandmaster",
    "challenger",
  ];
  return keys.includes(lower) ? lower : "unranked";
}

export type RankDisplayRanked = {
  tier?: string;
  rank?: string | null;
  leaguePoints?: number;
  wins?: number;
  losses?: number;
} | null;

type RankDisplayCardProps = {
  ranked?: RankDisplayRanked;
  accountLabel: string;
  winRateLine: string;
};

export default function RankDisplayCard({
  ranked,
  accountLabel,
  winRateLine,
}: RankDisplayCardProps) {
  return (
    <View className="border-border bg-card flex h-16 w-full flex-row items-center justify-between border px-4 py-2">
      <View className="flex flex-1 flex-row items-center gap-3">
        <View className="flex h-12 w-12 shrink-0 items-center justify-center">
          <RankEmblem tier={riotTierToEmblemTier(ranked?.tier)} />
        </View>
        <View className="w-full flex-1 flex-col">
          <View className="flex w-full flex-row items-center justify-between gap-1">
            <View className="flex flex-row items-center gap-1">
              {ranked?.tier ? (
                <>
                  <Text className="font-sans-semibold text-text text-base">
                    {formatRankTitle(
                      ranked.tier ?? "Unranked",
                      ranked.rank ?? "",
                    )}{" "}
                  </Text>
                  <Text className="font-sans-semibold text-text-muted text-base">
                    {ranked.leaguePoints} LP
                  </Text>
                </>
              ) : (
                <Text className="font-sans-semibold text-text text-base">
                  Unranked
                </Text>
              )}
            </View>
            {ranked?.rank && (
              <View className="flex flex-row items-center gap-1">
                <Text className="font-mono-medium text-text text-xs uppercase">
                  {ranked?.wins ?? 0}
                  <Text className="font-sans-medium text-text text-xs uppercase">
                    W
                  </Text>
                </Text>
                <Text className="font-mono-medium text-text text-xs uppercase">
                  {ranked?.losses ?? 0}
                  <Text className="font-sans-medium text-text text-xs uppercase">
                    L
                  </Text>
                </Text>
              </View>
            )}
          </View>
          <View className="flex w-full flex-row items-center justify-between gap-1">
            <Text className="font-sans-medium text-text-secondary text-xs">
              {accountLabel}
            </Text>
            {ranked?.rank && (
              <View className="flex flex-row items-center gap-1">
                <Text className="font-mono-semibold text-text-muted text-xs uppercase">
                  {winRateLine}
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
