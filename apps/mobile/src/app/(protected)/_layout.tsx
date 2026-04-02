import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function ProtectedLayout() {
	return (
		<>
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
		</>
	);
}
