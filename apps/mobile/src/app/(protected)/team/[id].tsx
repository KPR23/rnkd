import { Text } from "react-native";

import { Stack } from "expo-router";

import { HeaderBar } from "@/src/components/Header";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";

export default function TeamProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <ScreenScroll header={<HeaderBar variant="centered" title="Team" />}>
          <Text className="text-text text-center font-sans">
            Team profiles are not available yet.
          </Text>
        </ScreenScroll>
      </Screen>
    </>
  );
}
