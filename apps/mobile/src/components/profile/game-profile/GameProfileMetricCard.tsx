import { View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

export default function GameProfileMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="border-muted bg-card min-w-0 flex-1 flex-col justify-center border px-3.5 py-2.5">
      <AppText className="text-xs" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText className="text-base" weight="medium">
        {value}
      </AppText>
    </View>
  );
}
