"use client";

import { trpc } from "@/src/trpc/client";

export function ListMatchHistory() {
	const { data: matchHistory } = trpc.riot.getMatchHistory.useQuery();
	return (
		<div>
			ListMatchHistory
			{matchHistory?.map((match) => (
				<div key={match.matches.id}>
					{match.matches.team1Score} - {match.matches.team2Score} |{" "}
					{match.matches.playedAt.toLocaleDateString()}
					{" Stats: "}
					{match.match_participants.kills} / {match.match_participants.deaths} /
					{match.match_participants.assists}{" "}
				</div>
			))}
		</div>
	);
}
