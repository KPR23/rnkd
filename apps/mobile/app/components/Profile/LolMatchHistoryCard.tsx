import type { LolMatchHistoryRow } from "@repo/types";
import { Text, View } from "react-native";

export default function LolMatchHistoryCard({
	matchHistory,
}: {
	matchHistory: LolMatchHistoryRow;
}) {
	return (
		<View>
			<Text>{matchHistory.matches.externalMatchId}</Text>
		</View>
	);
}
