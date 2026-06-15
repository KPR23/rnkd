import { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Stack } from "expo-router";

import AddLinkedAccountModal from "@/src/app/(protected)/(settings)/AddLinkedAccountModal";
import LinkedAccountsList from "@/src/app/(protected)/(settings)/LinkedAccountsList";
import { HeaderBar, HeaderDescription } from "@/src/components/Header";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

const LINKED_ACCOUNTS_DESCRIPTION =
  "Manage your linked accounts and connect new games to track performance, sync stats, and challenge your friends";

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
        <Stack.Screen options={{ headerShown: false }} />
        <Screen>
          <ScreenScroll
            header={
              <HeaderBar variant="centered" title="Linked accounts" />
            }
            scrollHeader={
              <HeaderDescription description={LINKED_ACCOUNTS_DESCRIPTION} />
            }
          >
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator />
            </View>
          </ScreenScroll>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        footer={
          <ScreenFooter
            primaryAction={{
              text: "Connect new account",
              onPress: () => setIsModalVisible(true),
            }}
          />
        }
      >
        <ScreenScroll
          header={<HeaderBar variant="centered" title="Linked accounts" />}
          scrollHeader={
            <HeaderDescription description={LINKED_ACCOUNTS_DESCRIPTION} />
          }
        >
          <LinkedAccountsList linkedAccounts={linkedAccounts} />
        </ScreenScroll>
      </Screen>
      <AddLinkedAccountModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
}
