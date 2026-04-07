import GameLogo from "@/src/components/games/GameLogo";
import AccountDetailsModal from "@/src/components/profile/AccountDetailsModal";
import { DRAGON_CDN_VERSION } from "@/src/lib/constants/riotApiUrl";
import {
	GAMES,
	isLolGameAccount,
	type Cs2FaceitGameAccount,
	type GameAccount,
	type LolGameAccount,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import { CaretRightIcon, IconContext } from "phosphor-react-native";
import { useState, type ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const accountRowIconContext = {
	size: 19,
	color: colors.textMuted,
	weight: "bold" as const,
};

function LolAccountBody({ gameAccount }: { gameAccount: LolGameAccount }) {
	return (
		<View className="flex flex-row items-center gap-3">
			<Image
				source={{
					uri: `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`,
				}}
				className="w-12 h-12 rounded-full"
			/>
			<View className="flex flex-col gap-0.5 min-w-0 flex-1">
				<View className="flex flex-row items-center gap-1.5 flex-wrap">
					<Text className="font-sans-semibold text-base text-text">
						{gameAccount.profile.gameName}
					</Text>
					<Text className="font-sans-semibold text-sm text-text-secondary">
						#{gameAccount.profile.tagLine}
					</Text>
				</View>

				<View className="flex flex-row items-center gap-1">
					<Text className="font-mono-medium text-xs uppercase text-text-secondary">
						Level
					</Text>
					<Text className="font-mono-semibold text-xs text-text-secondary">
						{gameAccount.profile.summonerLevel}
					</Text>
				</View>
			</View>
		</View>
	);
}

function Cs2FaceitAccountBody({
	gameAccount,
}: {
	gameAccount: Cs2FaceitGameAccount;
}) {
	const faceitNick =
		gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
	const steamNick = gameAccount.profile?.steamNickname?.trim();

	return (
		<View className="flex flex-row items-center gap-3 min-w-0 flex-1">
			<View className="flex flex-col gap-2 min-w-0 flex-1">
				<View className="flex flex-col gap-0.5">
					<Text className="font-mono-medium text-xs uppercase text-text-secondary">
						Faceit
					</Text>
					<Text
						className="font-sans-semibold text-base text-text"
						numberOfLines={1}
					>
						{faceitNick}
					</Text>
				</View>
				{steamNick ? (
					<View className="flex flex-col gap-0.5">
						<Text className="font-mono-medium text-xs uppercase text-text-secondary">
							Steam
						</Text>
						<Text
							className="font-sans-semibold text-sm text-text-secondary"
							numberOfLines={1}
						>
							{steamNick}
						</Text>
					</View>
				) : null}
			</View>
		</View>
	);
}

function FallbackAccountBody({ gameAccount }: { gameAccount: GameAccount }) {
	return (
		<View className="flex flex-row items-center gap-3 min-w-0 flex-1">
			<Text
				className="font-sans-semibold text-base text-text"
				numberOfLines={2}
			>
				{gameAccount.externalId}
			</Text>
		</View>
	);
}

function accountCardPresentation(gameAccount: GameAccount): {
	bgClass: string;
	label: string;
	body: ReactNode;
} {
	switch (gameAccount.gameId) {
		case GAMES.CS2_FACEIT:
			return {
				bgClass: "bg-games-cs2",
				label: "FACEIT",
				body: <Cs2FaceitAccountBody gameAccount={gameAccount} />,
			};
		case GAMES.LOL:
			if (!isLolGameAccount(gameAccount)) {
				return {
					bgClass: "bg-games-lol",
					label: "Unknown",
					body: <FallbackAccountBody gameAccount={gameAccount} />,
				};
			}
			return {
				bgClass: "bg-games-lol",
				label: gameAccount.profile.platformRoute,
				body: <LolAccountBody gameAccount={gameAccount} />,
			};
		default:
			return {
				bgClass: "dark",
				label: "Unknown",
				body: <FallbackAccountBody gameAccount={gameAccount} />,
			};
	}
}

export default function ConnectedAccountCard({
	gameAccount,
}: {
	gameAccount: GameAccount;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { bgClass, label, body } = accountCardPresentation(gameAccount);

	return (
		<View className="flex flex-col">
			<View
				className={`h-12 px-3 py-2.5 flex flex-row w-full items-center justify-between ${bgClass}`}
			>
				<GameLogo gameId={gameAccount.gameId} maxHeight={22} />
				<Text className="font-mono-bold text-sm uppercase text-text text-right">
					{label}
				</Text>
			</View>
			<IconContext.Provider value={accountRowIconContext}>
				<TouchableOpacity
					activeOpacity={0.7}
					className="p-5 bg-card border-t-0 border border-border flex flex-row items-center justify-between"
					onPress={() => {
						setIsModalOpen(true);
					}}
				>
					<View className="flex-1 min-w-0 flex-row items-center">{body}</View>
					<View className="shrink-0">
						<CaretRightIcon />
					</View>
				</TouchableOpacity>
			</IconContext.Provider>

			<AccountDetailsModal
				gameAccount={gameAccount}
				visible={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</View>
	);
}
