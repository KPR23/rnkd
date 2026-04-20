import { Text, View } from "react-native";

import { type GameProfilePanelProps } from "@/src/components/GameProfileRegistry";

export default function DefaultGamePanel({
  gameAccount,
}: GameProfilePanelProps) {
  return (
    <View className="w-full px-4 py-6">
      <Text className="text-text-secondary font-sans text-sm">
        No profile panel available for this game ({gameAccount.gameId})
      </Text>
    </View>
  );
}
