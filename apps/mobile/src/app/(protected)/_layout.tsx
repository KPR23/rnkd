import { StatusBar } from "react-native";

import { Stack } from "expo-router";

import { colors } from "@repo/ui/colors";

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
            headerShown: false,
            title: "Settings",
          }}
        />
        <Stack.Screen
          name="(settings)/linked-accounts"
          options={{
            headerShown: false,
            title: "Linked accounts",
          }}
        />
        <Stack.Screen
          name="(settings)/personal-information"
          options={{
            headerShown: false,
            title: "Personal information",
          }}
        />
        <Stack.Screen
          name="player/[id]"
          options={{
            headerShown: false,
            title: "Player",
          }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: false,
            title: "Game",
          }}
        />
        <Stack.Screen
          name="game-profile/[gameAccountId]"
          options={{
            headerShown: false,
            title: "Game profile",
          }}
        />
        <Stack.Screen
          name="team/[id]"
          options={{
            headerShown: false,
            title: "Team",
          }}
        />
      </Stack>
    </>
  );
}
