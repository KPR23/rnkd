import { Stack } from "expo-router";
import { StatusBar } from "react-native";
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
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="settings"
					options={{
						title: "Settings",
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
					}}
				/>
			</Stack>
		</>
	);
}
