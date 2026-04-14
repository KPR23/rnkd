import Button from "@/src/components/Button";
import { trpc } from "@/src/utils/trpc";
import {
	GameAccount,
	GAMES,
	isCs2FaceitGameAccount,
	isLolGameAccount,
	type GameId,
} from "@repo/types";
import { useState } from "react";
import { Alert, Modal, Text, View } from "react-native";

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

export default function LinkedAccountCard({
	linkedAccount,
}: {
	linkedAccount: GameAccount;
}) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const utils = trpc.useUtils();
	const { mutate: unlinkLolAccount } =
		trpc.gameAccount.unlinkLolAccount.useMutation({
			onSuccess: () => {
				utils.gameAccount.getGameAccounts.invalidate();
			},
		});
	const { mutate: unlinkCS2FaceitAccount } =
		trpc.gameAccount.unlinkCS2FaceitAccount.useMutation({
			onSuccess: () => {
				utils.gameAccount.getGameAccounts.invalidate();
			},
		});

	const handleUnlink = (linkedAccount: GameAccount) => {
		Alert.alert(
			"Unlink account",
			"Are you sure you want to unlink this account?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Unlink",
					style: "destructive",
					onPress: () => {
						try {
							if (isLolGameAccount(linkedAccount)) {
								unlinkLolAccount({ gameAccountId: linkedAccount.id });
							} else if (isCs2FaceitGameAccount(linkedAccount)) {
								unlinkCS2FaceitAccount({ gameAccountId: linkedAccount.id });
							}
						} catch (error) {
							console.error(error);
						}
					},
				},
			],
		);
	};

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
				actionText={linkedAccount.externalId && "Unlink"}
				onPress={() => {
					linkedAccount.externalId && handleUnlink(linkedAccount);
				}}
			/>
		</View>
	);
}
