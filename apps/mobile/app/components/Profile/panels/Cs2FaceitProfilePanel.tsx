import { isCs2FaceitGameAccount } from "@repo/types";
import { View } from "react-native";
import Text from "@/app/components/Text";
import type { GameProfilePanelProps } from "@/profile/GameProfileRegistry";

export default function Cs2FaceitProfilePanel({
	gameAccount,
}: GameProfilePanelProps) {
	if (!isCs2FaceitGameAccount(gameAccount)) {
		return null;
	}

	const subtitle =
		[
			gameAccount.profile?.faceitNickname,
			gameAccount.profile?.steamNickname,
		]
			.filter(Boolean)
			.join(" · ") ||
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
