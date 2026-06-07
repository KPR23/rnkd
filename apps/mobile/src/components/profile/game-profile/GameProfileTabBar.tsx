import { Pressable, View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type Tab = "overview" | "stats";

export default function GameProfileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable onPress={() => onTabChange("overview")}>
        <AppText
          className="text-lg"
          weight="medium"
          color={activeTab === "overview" ? colors.text : colors.textSecondary}
        >
          Overview
        </AppText>
      </Pressable>
      <Pressable disabled>
        <AppText
          className="text-lg"
          weight="medium"
          color={colors.textSecondary}
        >
          Stats
        </AppText>
      </Pressable>
    </View>
  );
}
