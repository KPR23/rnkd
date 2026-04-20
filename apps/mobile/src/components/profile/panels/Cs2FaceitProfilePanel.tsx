import { Text, View } from "react-native";

import { isCs2FaceitGameAccount } from "@repo/types";
import { type GameProfilePanelProps } from "@/src/components/GameProfileRegistry";

export default function Cs2FaceitProfilePanel({
  gameAccount,
}: GameProfilePanelProps) {
  if (!isCs2FaceitGameAccount(gameAccount)) {
    return null;
  }

  const subtitle =
    [gameAccount.profile?.faceitNickname, gameAccount.profile?.steamNickname]
      .filter(Boolean)
      .join(" · ") || gameAccount.externalId;

  return (
    <View className="w-full px-4 py-6">
      <Text className="font-sans-semibold text-text text-base">
        CS2 (FACEIT)
      </Text>
      <Text className="text-text-secondary mt-1 font-sans text-sm">
        {subtitle}
      </Text>
    </View>
  );
}
