import { View } from "react-native";
import Text from "./Text";
import RankEmblem from "./Riot/RankEmblems";
import type { GameAccount } from "@repo/types";

const placeholderStats = {
	rank: "—",
	queueType: "Ranked Solo/Duo",
	wins: 0,
	losses: 0,
	winRate: 0,
};

type ProfileGameStatCardProps = {
	gameAccount: GameAccount;
};

export default function ProfileGameStatCard({
	gameAccount,
}: ProfileGameStatCardProps) {
	const summonerLine =
		gameAccount.gameName && gameAccount.tagLine
			? `${gameAccount.gameName}#${gameAccount.tagLine}`
			: gameAccount.gameName ??
				gameAccount.tagLine ??
				gameAccount.externalId.slice(0, 8);

	const levelLabel =
		gameAccount.summonerLevel != null
			? `Lvl ${gameAccount.summonerLevel}`
			: null;

	return (
		<View className="w-full flex flex-col">
			<View className="w-full h-16 text-text pl-3 pr-4 py-2 flex-row gap-5 items-center justify-between">
				<View className="flex-row gap-3 items-center flex-1 min-w-0">
					<View className="w-12 h-12 flex items-center justify-center shrink-0">
						<RankEmblem tier="gold" />
					</View>
					<View className="flex-col items-start min-w-0 flex-1">
						<Text
							className="text-base font-sans-semibold text-text"
							numberOfLines={1}
						>
							{summonerLine}
						</Text>
						<Text className="font-mono-semibold text-text-secondary uppercase text-xs">
							{levelLabel
								? `${placeholderStats.queueType} · ${levelLabel}`
								: placeholderStats.queueType}
						</Text>
					</View>
				</View>
				<View className="flex-col gap-0.5 justify-center items-end shrink-0">
					<Text className="text-xs font-mono-medium line-height-1 text-text">
						{placeholderStats.wins}W {placeholderStats.losses}L
					</Text>
					<Text className="text-xs font-mono-semibold line-height-1 text-text-secondary">
						{placeholderStats.winRate}%
						<Text
							className="text-text-secondary font-sans-medium text-xs"
							style={{ letterSpacing: -0.35 }}
						>
							{" "}
							WR
						</Text>
					</Text>
				</View>
			</View>
			<View className="w-full h-12 flex flex-row items-center justify-between border-t border-border">
				<View className="flex-1 items-center justify-center border-r h-full border-border">
					<StatItem value="—" label="Games" />
				</View>
				<View className="flex-1 items-center justify-center border-r h-full border-border">
					<StatItem value="—" label="AVG K/D" />
				</View>
				<View className="flex-1 w-full items-center justify-center h-full">
					<StatItem value="—" label="AVG HS%" />
				</View>
			</View>
		</View>
	);
}

const StatItem = ({ value, label }: { value: string; label: string }) => {
	return (
		<View className="flex-col items-center justify-center -gap-1">
			<Text className="font-mono-bold text-text text-sm text-center leading-none">
				{value}
			</Text>
			<Text className="font-sans-medium uppercase text-text-secondary text-xs text-center leading-none">
				{label}
			</Text>
		</View>
	);
};
