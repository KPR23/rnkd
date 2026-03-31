import Frame from "@/app/components/Frame";
import { Cs2FaceitGameAccount } from "@repo/types";
import { Text, View } from "react-native";

export default function Cs2FaceitAccountDetailsModal({
	gameAccount,
}: {
	gameAccount: Cs2FaceitGameAccount;
}) {
	const faceitNick =
		gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
	const steamNick = gameAccount.profile?.steamNickname?.trim();

	return (
		<Frame className="flex flex-col gap-4">
			<View className="flex flex-col gap-1">
				<Text className="text-text-muted text-sm font-sans-medium">Faceit</Text>
				<Text className="text-text text-xl font-sans-semibold">{faceitNick}</Text>
			</View>
			{steamNick ? (
				<View className="flex flex-col gap-1">
					<Text className="text-text-muted text-sm font-sans-medium">
						Steam
					</Text>
					<Text className="text-text text-lg font-sans-semibold">{steamNick}</Text>
				</View>
			) : null}
		</Frame>
	);
}
