import { Text, TouchableOpacity, View } from "react-native";

import { CaretRightIcon, IconContext } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";

interface SettingsCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const iconContext = {
  size: 20,
  color: colors.gray,
  weight: "regular" as const,
};

export default function SettingsCard({
  title,
  icon,
  onPress,
}: SettingsCardProps) {
  return (
    <IconContext.Provider value={iconContext}>
      <TouchableOpacity
        activeOpacity={0.7}
        className="border-muted bg-card flex h-12 flex-row items-center justify-between! gap-2 border pr-3 pl-4"
        onPress={onPress}
      >
        <View className="flex flex-row items-center gap-3">
          {icon}
          <Text className="font-sans-medium text-text text-sm">{title}</Text>
        </View>
        <CaretRightIcon />
      </TouchableOpacity>
    </IconContext.Provider>
  );
}
