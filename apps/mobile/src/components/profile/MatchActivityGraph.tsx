import { Text, View } from "react-native";

import type { MatchActivityDay } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function chunkWeeks(days: MatchActivityDay[]) {
  const weeks: MatchActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function MatchActivityGraph({
  days,
}: {
  days: MatchActivityDay[];
}) {
  const weeks = chunkWeeks(days);

  return (
    <View className="flex-row gap-4">
      <View className="justify-between">
        {WEEKDAY_LABELS.map((label) => (
          <AppText
            key={label}
            className="text-right text-xs"
            weight="medium"
            color={colors.textSecondary}
          >
            {label}
          </AppText>
        ))}
      </View>
      <View className="flex-1 flex-row gap-1.5">
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="gap-1.5">
            {week.map((day) => (
              <View
                key={day.date}
                className={`h-3.5 w-3.5 ${
                  day.played ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
