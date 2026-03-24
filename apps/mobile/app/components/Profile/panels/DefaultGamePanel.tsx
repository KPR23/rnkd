import { View } from "react-native";
import Text from "@/app/components/Text";
import type { GameProfilePanelProps } from "@/profile/GameProfileRegistry";

export default function DefaultGamePanel({
	gameAccount,
}: GameProfilePanelProps) {
	return (
		<View className="w-full py-6 px-4">
			<Text className="text-sm text-text-secondary">
				Brak panelu dla tej gry ({gameAccount.gameId})
			</Text>
		</View>
	);
}
