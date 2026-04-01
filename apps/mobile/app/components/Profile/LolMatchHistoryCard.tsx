import Frame from "@/app/components/Frame";
import { formatLolQueueLabel } from "@/constants/lolQueue";
import type { LolMatchHistoryRow } from "@repo/types";
import { Image, Text, View } from "react-native";

export default function LolMatchHistoryCard({
	matchHistory,
}: {
	matchHistory: LolMatchHistoryRow;
}) {
	const kills = matchHistory.match_participants.kills;
	const deaths = matchHistory.match_participants.deaths;
	const assists = matchHistory.match_participants.assists;
	const cs = matchHistory.match_participants.totalMinionsKilled;
	const championIconUrl = matchHistory.match_participants.championIconUrl;
	const queueId = matchHistory.matches.queueId;
	const queueLabel = formatLolQueueLabel(queueId);

	const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;

	return (
		<Frame className="items-start">
			<View className="flex flex-row items-center gap-2">
				<Image source={{ uri: championIconUrl }} className="w-8 h-8" />
				<View className="flex flex-col items-start">
					<Text className="text-text text-sm font-sans-medium">
						{matchHistory.match_participants.championName}
					</Text>
					<Text className="text-text-muted text-xs font-sans-medium">
						{queueLabel}
					</Text>
				</View>
			</View>
		</Frame>
	);
}
