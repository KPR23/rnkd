import { GameAccount, GAMES } from "@repo/types";
import { Image, Text, View } from "react-native";
import GameLogo from "@/app/components/games/GameLogo";
import { CaretRightIcon } from "phosphor-react-native";

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
				label: gameAccount.platformRoute ?? "Unknown",
			};
		default:
			return { bgClass: "dark", label: "Unknown" };
	}
}

export default function ConnectedAccountCard({
	gameAccount,
}: {
	gameAccount: GameAccount;
}) {
	const { bgClass, label } = headerForGame(gameAccount);

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
			<View className="p-5 bg-card border-t-0 border border-border flex flex-row items-center justify-between">
				<View className="flex flex-row items-center gap-3">
					<Image
						source={{
							uri: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${gameAccount.profileIconId}.png`,
						}}
						className="w-12 h-12 rounded-full"
					/>
					<View className="flex flex-col gap-0.5">
						<View className="flex flex-row items-center gap-1.5">
							<Text className="font-sans-semibold text-base text-text">
								{gameAccount.gameName}
							</Text>
							<Text className="font-sans-semibold text-sm text-text-secondary">
								#{gameAccount.tagLine}
							</Text>
						</View>

						<View className="flex flex-row items-center gap-1">
							<Text className="font-mono-medium text-xs uppercase text-text-secondary">
								Level
							</Text>
							<Text className="font-mono-semibold text-xs text-text-secondary">
								{gameAccount.summonerLevel}
							</Text>
						</View>
					</View>
				</View>
				<View>
					<CaretRightIcon size={19} color="#5b5666" weight="bold" />
				</View>
			</View>
		</View>
	);
}
