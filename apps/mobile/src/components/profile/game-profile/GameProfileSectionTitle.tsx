import { View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

export default function GameProfileSectionTitle({ title }: { title: string }) {
  return (
    <View className="w-full">
      <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
        {title}
      </AppText>
    </View>
  );
}
