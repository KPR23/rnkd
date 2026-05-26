import { View } from "react-native";

import AppText from "@/src/components/AppText";

type Props = {
  globalRs: number;
};

export default function RSBadge({ globalRs }: Props) {
  return (
    <View className="bg-card border-muted h-7.5 flex-row items-center justify-center gap-0.75 rounded-full border px-2">
      <AppText
        className="text-text text-base font-medium tracking-[-0.5px]"
        weight="medium"
      >
        {globalRs}
      </AppText>
      <AppText
        className="text-primary text-sm leading-px font-medium"
        weight="medium"
      >
        RS
      </AppText>
    </View>
  );
}
