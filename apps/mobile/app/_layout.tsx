import { Stack } from "expo-router";
import { TRPCProvider } from "../utils/provider";
import "../globals.css";
import { Platform, StatusBar } from "react-native";

export default function Layout() {
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
