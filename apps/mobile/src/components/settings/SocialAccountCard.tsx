import { View } from "react-native";

import { CheckIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type SocialAccountCardProps = {
  providerLabel: string;
  description: string;
};

export default function SocialAccountCard({
  providerLabel,
  description,
}: SocialAccountCardProps) {
  return (
    <View className="bg-card border-muted flex w-full flex-col border px-4">
      <View className="flex h-16 flex-row items-center justify-between">
        <AppText className="text-sm" weight="medium">
          {providerLabel}
        </AppText>
        <CheckIcon color={colors.primary} size={24} weight="bold" />
      </View>
      <View className="border-muted border-t py-3">
        <AppText className="text-sm" color={colors.textSecondary}>
          {description}
        </AppText>
      </View>
    </View>
  );
}
