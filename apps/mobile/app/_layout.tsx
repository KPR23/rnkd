import { Stack } from "expo-router";
import { TRPCProvider } from "../utils/provider";
import "../globals.css";

export default function Layout() {
	return (
		<TRPCProvider>
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
