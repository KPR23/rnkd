import { View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type Props = {
  globalRs: number;
};

export default function RSBadge({ globalRs }: Props) {
  return (
    <View className="bg-card border-muted h-7.5 flex-row items-center justify-center gap-0.75 rounded-full border px-2">
      <AppText className="text-base tracking-[-0.5px]" weight="medium">
        {globalRs}
      </AppText>
      <AppText
        className="text-sm leading-px"
        weight="medium"
        color={colors.primary}
      >
        RS
      </AppText>
    </View>
  );
}
