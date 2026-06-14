import { Pressable, View } from "react-native";

import { CaretRightIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type EditableProfileRowProps = {
  label: string;
  value: string;
  disabled?: boolean;
  onPress?: () => void;
};

export default function EditableProfileRow({
  label,
  value,
  disabled = false,
  onPress,
}: EditableProfileRowProps) {
  const labelColor = disabled ? colors.border : colors.text;
  const valueColor = disabled ? colors.border : colors.textSecondary;
  const chevronColor = disabled ? colors.border : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      className={`border-muted h-11 flex-row items-center justify-between border px-3 ${
        disabled ? "bg-background" : "bg-card"
      }`}
    >
      <AppText className="text-sm" weight="medium" color={labelColor}>
        {label}
      </AppText>
      <View className="min-w-0 flex-1 flex-row items-center justify-end gap-2 pl-3">
        <AppText
          className="max-w-[65%] text-right text-sm"
          color={valueColor}
          numberOfLines={1}
        >
          {value}
        </AppText>
        <CaretRightIcon size={20} color={chevronColor} />
      </View>
    </Pressable>
  );
}
