import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import { Stack } from "expo-router";
import { Text } from "react-native";

export default function TeamProfileScreen() {
	return (
		<Screen safeAreaEdges={["bottom", "left", "right"]}>
			<Stack.Screen options={{ title: "Team" }} />
			<ScreenTitle title="Team" />
			<Text className="mt-4 text-center font-sans text-text">
				Team profiles are not available yet.
			</Text>
		</Screen>
	);
}
