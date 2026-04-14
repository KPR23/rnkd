import { Text } from "react-native";

import { Stack } from "expo-router";

import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";

export default function TeamProfileScreen() {
  return (
    <Screen safeAreaEdges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: "Team" }} />
      <ScreenTitle title="Team" />
      <Text className="text-text mt-4 text-center font-sans">
        Team profiles are not available yet.
      </Text>
    </Screen>
  );
}
