import Screen from "@/src/components/Screen";
import { Text } from "react-native";

export default function LinkedAccountsScreen() {
	return (
		<Screen safeAreaEdges={["bottom", "left", "right"]}>
			<Text className="font-sans text-text">Linked accounts</Text>
		</Screen>
	);
}
