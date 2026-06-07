import { View } from "react-native";

import GameProfileMetricCard from "@/src/components/profile/game-profile/GameProfileMetricCard";
import GameProfileSectionTitle from "@/src/components/profile/game-profile/GameProfileSectionTitle";

type Metrics = {
  totalMatches: number;
  winRate: number | null;
  avgKd: number | null;
  eloPeak: number | null;
};

function formatMetric(
  value: number | null | undefined,
  formatter: (n: number) => string,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatter(value);
}

export default function GameProfileMetricsSection({
  metrics,
  isLoading,
}: {
  metrics: Metrics | undefined;
  isLoading: boolean;
}) {
  const loadingValue = isLoading ? "…" : "—";

  return (
    <View className="flex flex-col gap-2">
      <GameProfileSectionTitle title="All-time metrics" />
      <View className="flex flex-col gap-2.5">
        <View className="flex-row gap-2.5">
          <GameProfileMetricCard
            label="Total matches"
            value={
              isLoading
                ? loadingValue
                : String(metrics?.totalMatches ?? 0)
            }
          />
          <GameProfileMetricCard
            label="Winrate"
            value={
              isLoading
                ? loadingValue
                : formatMetric(metrics?.winRate ?? null, (n) =>
                    `${n.toFixed(0)}%`,
                  )
            }
          />
        </View>
        <View className="flex-row gap-2.5">
          <GameProfileMetricCard
            label="Avg K/D"
            value={
              isLoading
                ? loadingValue
                : formatMetric(metrics?.avgKd ?? null, (n) => n.toFixed(2))
            }
          />
          <GameProfileMetricCard
            label="ELO peak"
            value={
              isLoading
                ? loadingValue
                : formatMetric(metrics?.eloPeak ?? null, (n) =>
                    String(Math.round(n)),
                  )
            }
          />
        </View>
      </View>
    </View>
  );
}
