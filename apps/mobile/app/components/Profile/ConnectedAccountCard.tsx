import { GameAccount, GAMES } from "@repo/types";
import { Text, View } from "react-native";
import GameLogo from "@/app/components/games/GameLogo";

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
			<View>
				<Text className="font-mono-bold text-sm uppercase text-text text-right">
					{gameAccount.gameName} #{gameAccount.tagLine}
				</Text>
			</View>
		</View>
	);
}
