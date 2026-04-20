import { View } from "react-native";

import { Link, Stack } from "expo-router";

import { colors } from "@repo/ui/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Oops! Not Found",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <View className="bg-background flex-1 items-center justify-center">
        <Link href="/" className="text-text text-xl">
          Go back to home screen!
        </Link>
      </View>
    </>
  );
}
