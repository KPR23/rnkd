import { Stack, useLocalSearchParams } from "expo-router";

import { HeaderBar } from "@/src/components/Header";
import GameProfileScreen from "@/src/components/profile/game-profile/GameProfileScreen";
import Screen from "@/src/components/Screen";
import StickyHeaderShell from "@/src/components/StickyHeaderShell";

export default function GameProfileRoute() {
  const { gameAccountId } = useLocalSearchParams<{ gameAccountId: string }>();

  if (!gameAccountId) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <StickyHeaderShell
          header={<HeaderBar variant="centered" title="Game profile" />}
        >
          <GameProfileScreen gameAccountId={gameAccountId} />
        </StickyHeaderShell>
      </Screen>
    </>
  );
}
