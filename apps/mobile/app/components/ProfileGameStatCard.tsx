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
		<View className="w-full h-16 text-text border pl-3 pr-4 py-2 border-gray flex-row gap-5 items-center justify-between">
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
				<Text className="text-xs font-medium line-height-1 text-text">
					{stats[0]!.wins}W {stats[0]!.losses}L
				</Text>
				<Text className="text-xs font-mono-medium line-height-1 text-text-secondary">
					{stats[0]!.winRate}% WR
				</Text>
			</View>
		</View>
	);
}
