import Frame from "@/app/components/Frame";
import { formatGameDuration, formatMatchPlayedAt } from "@/constants/matchTime";
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
	const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
	const cs = matchHistory.match_participants.totalMinionsKilled;

	const championIconUrl = matchHistory.match_participants.championIconUrl;
	const queueLabel = formatLolQueueLabel(matchHistory.matches.queueId);
	const durationLabel = formatGameDuration(
		matchHistory.matches.durationSeconds,
	);
	const playedLabel = formatMatchPlayedAt(
		matchHistory.matches.playedAt instanceof Date
			? matchHistory.matches.playedAt
			: new Date(matchHistory.matches.playedAt),
	);

	return (
		<Frame className="w-full flex-row items-stretch p-3! gap-3 justify-between">
			<View className="min-w-0 flex-1 flex-row items-center gap-2">
				<Image source={{ uri: championIconUrl }} className="h-9 w-9 shrink-0" />
				<View className="min-w-0 flex-1 flex-col items-start">
					<Text
						className="text-text text-sm font-sans-medium"
						numberOfLines={1}
					>
						{matchHistory.match_participants.championName}
					</Text>
					<Text
						className="text-text-muted text-xs font-sans-medium"
						numberOfLines={1}
					>
						{queueLabel}
					</Text>
				</View>
			</View>

			<View className="flex-1 flex-col items-center justify-center">
				<Text className="text-text text-sm font-sans-medium">
					{kills}
					<Text className="text-text-muted"> / </Text>
					{deaths}
					<Text className="text-text-muted"> / </Text>
					{assists}
				</Text>
				<Text className="text-text-muted text-xs font-sans-medium">
					{cs ?? "—"} CS
				</Text>
			</View>

			<View className=" flex-1 flex-col items-end justify-center">
				<Text className="text-text text-sm font-sans-medium tabular-nums">
					{durationLabel}
				</Text>
				<Text
					className="text-text-muted text-xs font-sans-medium text-right"
					numberOfLines={2}
				>
					{playedLabel}
				</Text>
			</View>
		</Frame>
	);
}
