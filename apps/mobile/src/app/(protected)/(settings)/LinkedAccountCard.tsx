import Button from "@/src/components/Button";
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
		<View className="flex flex-row items-center w-full h-16">
			<View className="flex-col w-full gap-0.5 flex-1 border bg-card border-border px-4 h-full items-start justify-center">
				<Text className="font-sans-medium text-text-secondary text-xs">
					{GAME_TITLE[linkedAccount.gameId]}
				</Text>
				<Text className="font-sans-semibold text-text text-sm">
					{accountDisplayName(linkedAccount)}
				</Text>
			</View>
			<Button
				variant="secondary"
				className="h-full px-4 border-l-0"
				actionText={linkedAccount.externalId ? "Unlink" : "Link"}
				onPress={() => {
					linkedAccount.externalId
						? handleDisconnect(linkedAccount)
						: handleConnect(linkedAccount);
				}}
			/>
		</View>
	);
}
