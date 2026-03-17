import { View, Text } from "react-native";
import { GameType } from "./Profile/ProfileContent";

interface TabsProps {
	games: GameType[];
}

export default function Tabs({ games }: TabsProps) {
	return (
		<View>
			<Text>Tabs</Text>
		</View>
	);
}
