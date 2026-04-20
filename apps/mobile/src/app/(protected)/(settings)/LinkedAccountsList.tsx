import { Text, View } from "react-native";

import { GameAccount } from "@repo/types";
import LinkedAccountCard from "@/src/app/(protected)/(settings)/LinkedAccountCard";

export default function LinkedAccountsList({
  linkedAccounts,
}: {
  linkedAccounts: GameAccount[];
}) {
  return (
    <View className="flex flex-col gap-2">
      {linkedAccounts.map((linkedAccount) => (
        <LinkedAccountCard
          key={linkedAccount.id}
          linkedAccount={linkedAccount}
        />
      ))}
    </View>
  );
}
