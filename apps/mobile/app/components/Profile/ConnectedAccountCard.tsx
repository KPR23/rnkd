import { useState, type ReactNode } from "react";
import {
	GAMES,
	isLolGameAccount,
	type Cs2FaceitGameAccount,
	type GameAccount,
	type LolGameAccount,
} from "@repo/types";
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import GameLogo from "@/app/components/games/GameLogo";
import { CaretRightIcon } from "phosphor-react-native";
import AccountDetailsModal from "@/app/components/AccountDetailsModal";

const DRAGON_CDN_VERSION = "14.24.1";

function headerForGame(gameAccount: GameAccount): {
	bgClass: string;
	label: string;
} {
	switch (gameAccount.gameId) {
		case GAMES.CS2_FACEIT:
			return { bgClass: "bg-games-cs2", label: "FACEIT" };
		case GAMES.LOL:
			return {
				bgClass: "bg-games-lol",
				label: isLolGameAccount(gameAccount)
					? gameAccount.profile.platformRoute
					: "Unknown",
			};
		default:
			return { bgClass: "dark", label: "Unknown" };
	}
}

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

export default function ConnectedAccountCard({
	gameAccount,
}: {
	gameAccount: GameAccount;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { bgClass, label } = headerForGame(gameAccount);

	let body: ReactNode;
	switch (gameAccount.gameId) {
		case GAMES.LOL:
			if (!isLolGameAccount(gameAccount)) {
				body = <FallbackAccountBody gameAccount={gameAccount} />;
				break;
			}
			body = <LolAccountBody gameAccount={gameAccount} />;
			break;
		case GAMES.CS2_FACEIT:
			body = <Cs2FaceitAccountBody gameAccount={gameAccount} />;
			break;
		default:
			body = <FallbackAccountBody gameAccount={gameAccount} />;
	}

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
			<Pressable
				className="p-5 bg-card border-t-0 border border-border flex flex-row items-center justify-between"
				onPress={() => {
					setIsModalOpen(true);
				}}
			>
				<View className="flex-1 min-w-0 flex-row items-center">{body}</View>
				<View className="shrink-0">
					<CaretRightIcon size={19} color="#5b5666" weight="bold" />
				</View>
			</Pressable>
			<AccountDetailsModal
				gameAccount={gameAccount}
				visible={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</View>
	);
}
