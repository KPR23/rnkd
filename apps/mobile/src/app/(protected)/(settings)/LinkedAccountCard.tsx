import {
	GameAccount,
	GAMES,
	isCs2FaceitGameAccount,
	isLolGameAccount,
	type GameId,
} from "@repo/types";
import { Text, TouchableOpacity, View } from "react-native";

const GAME_TITLE: Record<GameId, string> = {
	[GAMES.LOL]: "League of Legends",
	[GAMES.CS2_FACEIT]: "Counter-Strike 2",
};

function accountDisplayName(account: GameAccount): string {
	if (isLolGameAccount(account)) {
		const { gameName, tagLine } = account.profile;
		return `${gameName} #${tagLine}`;
	}
	if (isCs2FaceitGameAccount(account)) {
		return (
			account.profile?.faceitNickname?.trim() ||
			account.profile?.steamNickname?.trim() ||
			account.externalId
		);
	}
	throw new Error("Unexpected game account type");
}

const handleDisconnect = (linkedAccount: GameAccount) => {
	console.log("Disconnect");
};

const handleConnect = (linkedAccount: GameAccount) => {
	console.log("Connect");
};

export default function LinkedAccountCard({
	linkedAccount,
}: {
	linkedAccount: GameAccount;
}) {
	return (
		<View className="flex flex-row justify-between items-center w-full border bg-card border-border px-4 py-3">
			<View className="flex-col gap-0.5 w-full flex-1">
				<Text className="font-sans-medium text-text-secondary text-xs">
					{GAME_TITLE[linkedAccount.gameId]}
				</Text>

				<Text className="font-sans-medium text-text text-sm">
					{accountDisplayName(linkedAccount)}
				</Text>
			</View>
			<View className="flex flex-row items-center gap-2 w-fit shrink-0">
				<TouchableOpacity
					className="font-sans-medium text-primary text-sm"
					onPress={() => {
						linkedAccount.externalId
							? handleDisconnect(linkedAccount)
							: handleConnect(linkedAccount);
					}}
					activeOpacity={0.7}
				>
					<Text className="font-sans-medium text-primary text-right text-sm">
						{linkedAccount.externalId ? "Unlink" : "Link"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
