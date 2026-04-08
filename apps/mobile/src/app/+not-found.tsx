import { Link, Stack } from "expo-router";
import { colors } from "@repo/ui/colors";
import { View } from "react-native";

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
			<View className="flex-1 bg-background justify-center items-center">
				<Link href="/" className="text-xl text-text">
					Go back to home screen!
				</Link>
			</View>
		</>
	);
}
