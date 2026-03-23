import { View } from "react-native";
import Text from "../../Text";
import type { GameProfilePanelProps } from "../GameProfileRegistry";

export default function Cs2FaceitProfilePanel({
	gameAccount,
}: GameProfilePanelProps) {
	const subtitle =
		[gameAccount.gameName, gameAccount.tagLine].filter(Boolean).join(" · ") ||
		gameAccount.externalId;

	return (
		<View className="w-full py-6 px-4">
			<Text className="text-base font-sans-semibold text-text">
				CS2 (FACEIT)
			</Text>
			<Text className="mt-1 text-sm text-text-secondary">{subtitle}</Text>
		</View>
	);
}
