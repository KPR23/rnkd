import { ActivityIndicator, Text, View } from "react-native";

import { Stack, useLocalSearchParams } from "expo-router";

import { HeaderBar } from "@/src/components/Header";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { trpc } from "@/src/utils/trpc";

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: game,
    isLoading,
    isError,
  } = trpc.game.getById.useQuery({ id: id ?? "" }, { enabled: !!id });

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Screen>
          <ScreenScroll header={<HeaderBar variant="centered" title="Game" />}>
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator />
            </View>
          </ScreenScroll>
        </Screen>
      </>
    );
  }

  if (isError || !game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Screen>
          <ScreenScroll header={<HeaderBar variant="centered" title="Game" />}>
            <Text className="text-text text-center font-sans">
              Game not found.
            </Text>
          </ScreenScroll>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <ScreenScroll header={<HeaderBar variant="centered" title={game.name} />} />
      </Screen>
    </>
  );
}
