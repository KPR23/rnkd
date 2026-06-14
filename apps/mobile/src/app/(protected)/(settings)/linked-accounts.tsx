import { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Stack } from "expo-router";

import AddLinkedAccountModal from "@/src/app/(protected)/(settings)/AddLinkedAccountModal";
import LinkedAccountsList from "@/src/app/(protected)/(settings)/LinkedAccountsList";
import { WizardFooter } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

export default function LinkedAccountsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data: session, isPending: isAuthPending } = useAuth();
  const { data: gameAccounts, isPending: isAccountsPending } =
    trpc.gameAccount.getGameAccounts.useQuery(undefined, {
      enabled: !!session,
    });

  const linkedAccounts = useMemo(
    () => [...(gameAccounts?.lol ?? []), ...(gameAccounts?.faceit ?? [])],
    [gameAccounts],
  );

  if (isAuthPending || (session && isAccountsPending)) {
    return (
      <>
        <Stack.Screen options={{ title: "Linked accounts" }} />
        <Screen>
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator />
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Linked accounts" }} />
      <Screen
        footer={
          <WizardFooter
            actionText="Connect new account"
            onPress={() => setIsModalVisible(true)}
          />
        }
      >
        <View className="flex-1">
          <View className="flex flex-col gap-4">
            <Text className="font-sans-medium text-text-secondary text-xs">
              View your accounts, manage them, and connect new games to track
              stats.
            </Text>
            <LinkedAccountsList linkedAccounts={linkedAccounts} />
          </View>
        </View>
      </Screen>
      <AddLinkedAccountModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
}
