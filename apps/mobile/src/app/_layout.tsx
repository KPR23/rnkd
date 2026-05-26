import "@/globals.css";

import { useEffect } from "react";

import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
} from "@expo-google-fonts/ibm-plex-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { colors } from "@repo/ui/colors";
import { useAuth } from "@/src/lib/auth/use-auth";
import { TRPCProvider } from "@/src/utils/provider";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { data: session, isPending } = useAuth();

  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
  });

  const fontsReady = fontsLoaded || !!fontError;
  const ready = fontsReady && !isPending;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen
            name="(auth)/sign-in"
            options={{
              animation: "none",
              headerShown: false,
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <TRPCProvider>
      <RootNavigator />
    </TRPCProvider>
  );
}
