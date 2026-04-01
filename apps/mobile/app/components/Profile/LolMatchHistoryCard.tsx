import Frame from "@/app/components/Frame";
import type { LolMatchHistoryRow } from "@repo/types";
import { Text, View } from "react-native";

export default function LolMatchHistoryCard({
	matchHistory,
}: {
	matchHistory: LolMatchHistoryRow;
}) {
	const kills = matchHistory.match_participants.kills;
	const deaths = matchHistory.match_participants.deaths;
	const assists = matchHistory.match_participants.assists;

	const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;

	return (
		<Frame>
			<Text className="text-text text-sm font-sans-medium">
				{kills} / {deaths} / {assists} (KDA: {kda.toFixed(2)})
			</Text>
		</Frame>
	);
}
