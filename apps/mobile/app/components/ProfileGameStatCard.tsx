import { View } from "react-native";
import Text from "./Text";

const stats = [
	{
		rank: "Emerald III",
		queueType: "Ranked Solo/Duo",
		wins: 100,
		losses: 100,
		winRate: 50,
		currentElo: 100,
	},
];

export default function ProfileGameStatCard() {
	return (
		<View className="w-full h-16 text-text border px-4 py-2 border-gray flex-col gap-5 items-between justify-center">
			<View className="flex-col gap-0.5">
				<Text className="text-sm text-text">{stats[0]!.rank}</Text>
				<Text className="font-mono-semibold text-text-secondary uppercase text-xs">
					{stats[0]!.queueType}
				</Text>
			</View>
		</View>
	);
}
