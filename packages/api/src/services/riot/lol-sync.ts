import { db, GAMES, matches, matchParticipants } from "@repo/db";
import { eq } from "drizzle-orm";
import type { MatchParticipantInsert, MatchResponse } from "./types";

export async function mapRiotMatchToDb(
	riotMatch: MatchResponse,
	knownAccountsByPuuid: Record<string, string>,
) {
	return db.transaction(async (tx) => {
		const existingMatch = await tx.query.matches.findFirst({
			where: eq(matches.externalMatchId, riotMatch.metadata.matchId),
		});

		if (existingMatch) return existingMatch;

		const team1Id = riotMatch.info.teams.find((team) => team.teamId === 100);
		const team2Id = riotMatch.info.teams.find((team) => team.teamId === 200);

		const team1Score = team1Id?.objectives.champion?.kills ?? 0;
		const team2Score = team2Id?.objectives.champion?.kills ?? 0;

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
			matchId: string | undefined;
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
