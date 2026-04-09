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
						title: "Settings",
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
						headerBackButtonDisplayMode: "minimal",
					}}
				/>
				<Stack.Screen
					name="(settings)/linked-accounts"
					options={{
						title: "Linked accounts",
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
						headerBackButtonDisplayMode: "minimal",
					}}
				/>
				<Stack.Screen
					name="player/[id]"
					options={{
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
						headerBackButtonDisplayMode: "minimal",
					}}
				/>
				<Stack.Screen
					name="game/[id]"
					options={{
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
						headerBackButtonDisplayMode: "minimal",
					}}
				/>
				<Stack.Screen
					name="team/[id]"
					options={{
						headerStyle: { backgroundColor: colors.background },
						headerTintColor: colors.text,
						headerBackButtonDisplayMode: "minimal",
					}}
				/>
			</Stack>
		</>
	);
}
