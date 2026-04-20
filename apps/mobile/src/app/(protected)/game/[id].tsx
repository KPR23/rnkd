import { ActivityIndicator, Text, View } from "react-native";

import { Stack, useLocalSearchParams } from "expo-router";

import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
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
        <Stack.Screen options={{ title: "Game" }} />
        <View className="bg-background flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (isError || !game) {
    return (
      <Screen safeAreaEdges={["bottom", "left", "right"]}>
        <Stack.Screen options={{ title: "Game" }} />
        <ScreenTitle title="Game" />
        <Text className="text-text mt-4 text-center font-sans">
          Game not found.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: game.name }} />
      <ScreenTitle title={game.name} />
    </Screen>
  );
}
