import { Text, View } from "react-native";

import { Cs2FaceitGameAccount } from "@repo/types";
import Frame from "@/src/components/Frame";

export default function Cs2FaceitAccountDetailsModal({
  gameAccount,
}: {
  gameAccount: Cs2FaceitGameAccount;
}) {
  const faceitNick =
    gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
  const steamNick = gameAccount.profile?.steamNickname?.trim();

  return (
    <Frame className="flex flex-col gap-4">
      <View className="flex flex-col gap-1">
        <Text className="text-text-muted font-sans-medium text-sm">Faceit</Text>
        <Text className="text-text font-sans-semibold text-xl">
          {faceitNick}
        </Text>
      </View>
      {steamNick ? (
        <View className="flex flex-col gap-1">
          <Text className="text-text-muted font-sans-medium text-sm">
            Steam
          </Text>
          <Text className="text-text font-sans-semibold text-lg">
            {steamNick}
          </Text>
        </View>
      ) : null}
    </Frame>
  );
}
