import { StatusBar } from "react-native";

import { Stack } from "expo-router";

import { colors } from "@repo/ui/colors";

const commonStackOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerBackButtonDisplayMode: "minimal" as const,
};

export default function ProtectedLayout() {
  return (
    <>
      <StatusBar backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Profile",
          }}
        />
        <Stack.Screen
          name="(settings)/settings"
          options={{
            title: "Settings",
            ...commonStackOptions,
          }}
        />
        <Stack.Screen
          name="(settings)/linked-accounts"
          options={{
            title: "Linked accounts",
            ...commonStackOptions,
          }}
        />
        <Stack.Screen
          name="player/[id]"
          options={{
            title: "Player",
            ...commonStackOptions,
          }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{
            title: "Game",
            ...commonStackOptions,
          }}
        />
        <Stack.Screen
          name="team/[id]"
          options={{
            title: "Team",
            ...commonStackOptions,
          }}
        />
      </Stack>
    </>
  );
}
