import { GameProfilePanelProps } from "@/src/components/GameProfileRegistry";
import { Text, View } from "react-native";

export default function DefaultGamePanel({
	gameAccount,
}: GameProfilePanelProps) {
	return (
		<View className="w-full py-6 px-4">
			<Text className="font-sans text-sm text-text-secondary">
				No profile panel available for this game ({gameAccount.gameId})
			</Text>
		</View>
	);
}
