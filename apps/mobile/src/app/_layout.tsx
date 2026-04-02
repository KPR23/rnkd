import "@/globals.css";
import { authClient } from "@/src/lib/auth-client";
import { TRPCProvider } from "@/src/utils/provider";
import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
	JetBrainsMono_400Regular,
	JetBrainsMono_500Medium,
	JetBrainsMono_600SemiBold,
	JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
	const { data: session, isPending } = authClient.useSession();
	const [fontsLoaded, fontError] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		JetBrainsMono_400Regular,
		JetBrainsMono_500Medium,
		JetBrainsMono_600SemiBold,
		JetBrainsMono_700Bold,
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
						backgroundColor: "#131013",
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
				<Stack.Protected guard={!!!session}>
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
