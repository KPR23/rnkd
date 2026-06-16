import { View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

export default function OnboardingHeader() {
  return (
    <View className="gap-3">
      <AppText className="text-[32px] leading-9" weight="medium">
        Set up RNKD
      </AppText>
      <AppText className="text-base leading-6" color={colors.textSecondary}>
        Build your player identity and connect the accounts you want to track.
      </AppText>
    </View>
  );
}
