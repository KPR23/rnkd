import { View } from "react-native";
import Text from "./Text";
import RankEmblem from "./Riot/RankEmblems";

const stats = [
	{
		rank: "Emerald III",
		queueType: "Ranked Solo/Duo",
		wins: 120,
		losses: 140,
		winRate: 52,
		currentElo: 100,
	},
];

export default function ProfileGameStatCard() {
	return (
		<View className="w-full flex flex-col">
			<View className="w-full h-16 text-text pl-3 pr-4 py-2 flex-row gap-5 items-center justify-between">
				<View className="flex-row gap-3 items-center">
					<View className="w-12 h-12 flex items-center justify-center">
						<RankEmblem tier="gold" />
					</View>
					<View className="flex-col items-start">
						<Text className="text-base font-sans-semibold text-text">
							{stats[0]!.rank}
						</Text>
						<Text className="font-mono-semibold text-text-secondary uppercase text-xs">
							{stats[0]!.queueType}
						</Text>
					</View>
				</View>
				<View className="flex-col gap-0.5 justify-center items-end">
					<Text className="text-xs font-mono-medium line-height-1 text-text">
						{stats[0]!.wins}W {stats[0]!.losses}L
					</Text>
					<Text className="text-xs font-mono-semibold line-height-1 text-text-secondary">
						{stats[0]!.winRate}%
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
					<StatItem value="155" label="Games" />
				</View>
				<View className="flex-1 items-center justify-center border-r h-full border-border">
					<StatItem value="1.2" label="AVG K/D" />
				</View>
				<View className="flex-1 w-full items-center justify-center h-full">
					<StatItem value="58%" label="AVG HS%" />
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
