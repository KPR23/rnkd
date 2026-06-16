import { View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { TextField } from "@/src/components/TextField";

export default function OnboardingProfileStep({
  name,
  tag,
  onNameChange,
  onTagChange,
}: {
  name: string;
  tag: string;
  onNameChange: (value: string) => void;
  onTagChange: (value: string) => void;
}) {
  return (
    <View className="gap-5">
      <View className="gap-2">
        <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
          Your name
        </AppText>
        <TextField
          value={name}
          placeholder="Your name"
          maxLength={64}
          autoCapitalize="words"
          onChangeText={onNameChange}
        />
      </View>
      <View className="gap-2">
        <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
          Nickname
        </AppText>
        <TextField
          value={tag}
          placeholder="your_nickname"
          maxLength={32}
          autoCapitalize="none"
          onChangeText={onTagChange}
        />
        <AppText className="text-xs leading-4" color={colors.textSecondary}>
          Use 2-32 letters, numbers, or underscores.
        </AppText>
      </View>
    </View>
  );
}
