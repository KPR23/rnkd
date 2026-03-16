import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { StatusBar } from "react-native";
import { TRPCProvider } from "../utils/provider";
import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
	JetBrainsMono_400Regular,
	JetBrainsMono_600SemiBold,
	JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import "../globals.css";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
	const [fontsLoaded, fontError] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		JetBrainsMono_400Regular,
		JetBrainsMono_600SemiBold,
		JetBrainsMono_700Bold,
	});

	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded || fontError) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	useEffect(() => {
		onLayoutRootView();
	}, [onLayoutRootView]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<TRPCProvider>
			<StatusBar backgroundColor="#131013" />
			<Stack
				screenOptions={{
					contentStyle: {
						backgroundColor: "#131013",
					},
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</TRPCProvider>
	);
}
