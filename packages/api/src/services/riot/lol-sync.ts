import { db, GAMES, matches, matchParticipants } from "@repo/db";
import { and, eq } from "drizzle-orm";
import type { MatchParticipantInsert, MatchResponse } from "./types";

export async function mapRiotMatchToDb(
	riotMatch: MatchResponse,
	knownAccountsByPuuid: Record<string, string>,
) {
	return db.transaction(async (tx) => {
		const existingMatch = await tx.query.matches.findFirst({
			where: and(
				eq(matches.externalMatchId, riotMatch.metadata.matchId),
				eq(matches.gameId, GAMES.LOL),
			),
		});

		if (existingMatch) return existingMatch;

		const team1 = riotMatch.info.teams.find((team) => team.teamId === 100);
		const team2 = riotMatch.info.teams.find((team) => team.teamId === 200);

		const team1Score = team1?.objectives.champion?.kills ?? 0;
		const team2Score = team2?.objectives.champion?.kills ?? 0;

		const [match] = await tx
			.insert(matches)
			.values({
				id: crypto.randomUUID(),
				gameId: GAMES.LOL,
				externalMatchId: riotMatch.metadata.matchId,
				team1Score,
				team2Score,
				playedAt: new Date(riotMatch.info.gameCreation),
			})
			.returning();

		if (!match) {
			throw new Error("Failed to insert match");
		}

		const participantsToInsert: (MatchParticipantInsert & {
			matchId: string;
		})[] = riotMatch.info.participants.flatMap((participant) => {
			const gameAccountId = knownAccountsByPuuid[participant.puuid];

			if (!gameAccountId) return [];

			return [
				{
					matchId: match.id,
					gameAccountId,
					team: participant.teamId,
					// TODO
					partyId: null,
					win: participant.win,
					kills: participant.kills,
					deaths: participant.deaths,
					assists: participant.assists,
					// TODO
					eloBefore: 0,
					eloAfter: 0,
				},
			];
		});

		if (participantsToInsert.length > 0) {
			await tx.insert(matchParticipants).values(participantsToInsert);
		}

		return match;
	});
}
