import { Stack, useLocalSearchParams } from "expo-router";

import GameProfileScreen from "@/src/components/profile/game-profile/GameProfileScreen";
import Screen from "@/src/components/Screen";

export default function GameProfileRoute() {
  const { gameAccountId } = useLocalSearchParams<{ gameAccountId: string }>();

  if (!gameAccountId) {
    return null;
  }

  return (
    <Screen safeAreaEdges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: "Game profile" }} />
      <GameProfileScreen gameAccountId={gameAccountId} />
    </Screen>
  );
}
