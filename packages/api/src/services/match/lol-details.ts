import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  db,
  gameAccounts,
  GAMES,
  lolGameAccountProfiles,
  matches,
  matchParticipants,
} from "@repo/db";
import type {
  LolMatchDetails,
  LolMatchDetailsPlayer,
  LolMatchDetailsTeam,
} from "@repo/types";

function formatLolQueueLabel(queueId: number | null | undefined): string {
  switch (queueId) {
    case 400:
      return "Normal draft";
    case 420:
      return "Ranked Solo/Duo";
    case 430:
      return "Quickplay";
    case 440:
      return "Ranked Flex";
    case 450:
      return "ARAM";
    case 700:
      return "Clash";
    case 1700:
      return "Arena";
    default:
      return queueId == null ? "—" : `Queue ${queueId}`;
  }
}

function formatRiotId(
  profile: {
    gameName: string | null;
    tagLine: string | null;
  } | null,
  fallback: string,
) {
  if (profile?.gameName && profile.tagLine) {
    return `${profile.gameName}#${profile.tagLine}`;
  }

  if (profile?.gameName) {
    return profile.gameName;
  }

  return fallback;
}

function emptyTeam(
  id: 100 | 200,
  match: typeof matches.$inferSelect,
): LolMatchDetailsTeam {
  const isBlueTeam = id === 100;

  return {
    id,
    name: isBlueTeam ? "Blue team" : "Red team",
    score: isBlueTeam ? match.team1Score : match.team2Score,
    won: false,
    players: [],
  };
}

export async function getLolMatchDetails(input: {
  matchId: string;
  gameAccountId: string;
}): Promise<LolMatchDetails> {
  const match = await db.query.matches.findFirst({
    where: and(eq(matches.id, input.matchId), eq(matches.gameId, GAMES.LOL)),
  });

  if (!match) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const viewer = await db.query.matchParticipants.findFirst({
    where: and(
      eq(matchParticipants.matchId, input.matchId),
      eq(matchParticipants.gameAccountId, input.gameAccountId),
    ),
  });

  if (!viewer) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const rows = await db
    .select({
      participant: matchParticipants,
      profile: lolGameAccountProfiles,
    })
    .from(matchParticipants)
    .innerJoin(
      gameAccounts,
      eq(matchParticipants.gameAccountId, gameAccounts.id),
    )
    .leftJoin(
      lolGameAccountProfiles,
      eq(gameAccounts.id, lolGameAccountProfiles.gameAccountId),
    )
    .where(eq(matchParticipants.matchId, input.matchId));

  const blueTeam = emptyTeam(100, match);
  const redTeam = emptyTeam(200, match);

  for (const row of rows) {
    const { participant, profile } = row;
    const player: LolMatchDetailsPlayer = {
      id: participant.id,
      gameAccountId: participant.gameAccountId,
      riotId: formatRiotId(profile, participant.championName),
      championName: participant.championName,
      championIconUrl: participant.championIconUrl,
      teamPosition: participant.teamPosition || participant.individualPosition,
      isViewer: participant.gameAccountId === input.gameAccountId,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      totalMinionsKilled: participant.totalMinionsKilled,
      win: participant.win,
    };

    const team = participant.team === 100 ? blueTeam : redTeam;
    team.players.push(player);
    team.won = team.won || participant.win;
  }

  return {
    summary: {
      matchId: match.id,
      queueId: match.queueId,
      queueLabel: formatLolQueueLabel(match.queueId),
      playedAt: match.playedAt,
      durationSeconds: match.durationSeconds,
      viewerChampionName: viewer.championName,
      viewerChampionIconUrl: viewer.championIconUrl,
      viewerWon: viewer.win,
    },
    teams: [blueTeam, redTeam],
  };
}
