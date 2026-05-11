import { and, eq } from "drizzle-orm";

import { db, GAMES, matches, matchParticipants } from "@repo/db";

import type { MatchParticipantInsert, MatchResponse, RiotParticipant } from "./types";

type LolSyncTransaction = Parameters<
  Parameters<(typeof db)["transaction"]>[0]
>[0];

function resolveParticipantPuuid(
  participant: RiotParticipant,
  riotMatch: MatchResponse,
  index: number,
): string | undefined {
  const raw = participant.puuid;
  if (typeof raw === "string" && raw.length > 0) return raw;

  const fromMeta = riotMatch.metadata.participants[index];
  if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta;

  return undefined;
}

function getParticipantCs(participant: RiotParticipant) {
	return (
		(participant.totalMinionsKilled ?? 0) +
		(participant.neutralMinionsKilled ?? 0)
	);
}

function getChampionIconUrl(championName: string) {
	const version = "16.4.1";
	return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}

export function buildLolParticipantsForKnownAccounts(
  matchId: string,
  riotMatch: MatchResponse,
  knownAccountsByPuuid: Record<string, string>,
): MatchParticipantInsert[] {
  const rows: MatchParticipantInsert[] = [];

  riotMatch.info.participants.forEach((participant, index) => {
    const puuid = resolveParticipantPuuid(participant, riotMatch, index);
    if (!puuid) return;

    const gameAccountId = knownAccountsByPuuid[puuid];
    if (!gameAccountId) return;

    const totalMinionsKilled = getParticipantCs(participant);

    rows.push({
      matchId,
      gameAccountId,
      team: participant.teamId,
      partyId: null,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      totalMinionsKilled,
      championId: participant.championId,
      championName: participant.championName,
      championIconUrl: getChampionIconUrl(participant.championName),
      teamPosition: participant.teamPosition,
      individualPosition: participant.individualPosition,
      eloBefore: 0,
      eloAfter: 0,
    });
  });

  return rows;
}

async function upsertKnownLolParticipants(
  tx: LolSyncTransaction,
  matchId: string,
  riotMatch: MatchResponse,
  knownAccountsByPuuid: Record<string, string>,
) {
  const rows = buildLolParticipantsForKnownAccounts(
    matchId,
    riotMatch,
    knownAccountsByPuuid,
  );
  if (rows.length === 0) return;

  await tx
    .insert(matchParticipants)
    .values(rows)
    .onConflictDoNothing({
      target: [matchParticipants.matchId, matchParticipants.gameAccountId],
    });
}

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

    if (existingMatch) {
      await upsertKnownLolParticipants(
        tx,
        existingMatch.id,
        riotMatch,
        knownAccountsByPuuid,
      );
      return existingMatch;
    }

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
        queueId: riotMatch.info.queueId,
        team1Score,
        team2Score,
        playedAt: new Date(riotMatch.info.gameCreation),
        durationSeconds: riotMatch.info.gameDuration,
      })
      .returning();

    if (!match) {
      throw new Error("Failed to insert match");
    }

    const participantsToInsert = buildLolParticipantsForKnownAccounts(
      match.id,
      riotMatch,
      knownAccountsByPuuid,
    );

    if (participantsToInsert.length > 0) {
      await tx.insert(matchParticipants).values(participantsToInsert);
    }

    return match;
  });
}
