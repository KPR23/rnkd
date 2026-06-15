import { useEffect } from "react";
import { StatusBar } from "react-native";

import { Stack, usePathname, useRouter } from "expo-router";

import { colors } from "@repo/ui/colors";
import { useAuth } from "@/src/lib/auth/use-auth";

export default function ProtectedLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useAuth();

  useEffect(() => {
    if (!session?.user || pathname.includes("/onboarding")) {
      return;
    }

    if (!session.user.tag) {
      router.replace("/(protected)/onboarding");
    }
  }, [pathname, router, session?.user]);

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
          name="onboarding"
          options={{
            headerShown: false,
            title: "Onboarding",
          }}
        />
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
