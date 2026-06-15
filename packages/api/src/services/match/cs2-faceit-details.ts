import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  cs2FaceitMatchPlayers,
  db,
  GAMES,
  matches,
} from "@repo/db";
import type {
  Cs2FaceitMatchDetails,
  Cs2FaceitMatchDetailsPlayer,
  FaceitMatchDetail,
  FaceitMatchRosterPlayer,
  FaceitMatchStatsPayload,
} from "@repo/types";

import { findGameAccountById } from "../../repositories/game-accounts.repo";
import { getFaceitMatch, getFaceitMatchStats } from "../faceit/faceit-client";
import {
  mergePlayerStatsFromRounds,
  normalizeFaceitStatKey,
  resolveFaceitMapName,
  resolveFaceitWinningTeamOneBased,
} from "../faceit/faceit-stats";

const REGION_QUEUE_LABELS: Record<string, string> = {
  EU: "Europe 5V5 Queue",
  NA: "North America 5V5 Queue",
  SA: "South America 5V5 Queue",
};

const SERVER_STAT_KEYS = [
  "location",
  "server",
  "game server",
  "datacenter",
  "region",
];

function formatMapDisplayName(mapName: string | null | undefined): string {
  const trimmed = mapName?.trim();
  if (!trimmed) return "Unknown map";

  const withoutPrefix = trimmed.replace(/^de_/i, "");
  return withoutPrefix
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatQueueLabel(region: string | null | undefined): string {
  const key = region?.trim().toUpperCase();
  if (key && REGION_QUEUE_LABELS[key]) {
    return REGION_QUEUE_LABELS[key];
  }
  if (key) {
    return `${key} 5V5 Queue`;
  }
  return "Europe 5V5 Queue";
}

function parseServerLabel(
  statsPayload: FaceitMatchStatsPayload | null,
): string | null {
  for (const round of statsPayload?.rounds ?? []) {
    const roundStats = round.round_stats ?? {};
    for (const [rawKey, rawVal] of Object.entries(roundStats)) {
      const normalizedKey = normalizeFaceitStatKey(rawKey);
      if (
        SERVER_STAT_KEYS.some(
          (candidate) =>
            normalizedKey === candidate || normalizedKey.includes(candidate),
        )
      ) {
        const value = rawVal?.trim();
        if (value) {
          return value.endsWith(" Server") ? value : `${value} Server`;
        }
      }
    }
  }
  return null;
}

function teamScoresFromDetail(detail: FaceitMatchDetail): [number, number] {
  const score = detail.results?.score ?? {};
  const teamKeys = Object.keys(detail.teams ?? {});
  const team1Key = score.faction1 !== undefined ? "faction1" : teamKeys[0];
  const team2Key = score.faction2 !== undefined ? "faction2" : teamKeys[1];
  const team1Score = team1Key ? score[team1Key] : undefined;
  const team2Score = team2Key ? score[team2Key] : undefined;

  return [
    typeof team1Score === "number" && Number.isFinite(team1Score)
      ? team1Score
      : 0,
    typeof team2Score === "number" && Number.isFinite(team2Score)
      ? team2Score
      : 0,
  ];
}

function rosterPlayers(block: {
  roster?: FaceitMatchRosterPlayer[];
  roster_v1?: FaceitMatchRosterPlayer[] | null;
}): FaceitMatchRosterPlayer[] {
  const seen = new Set<string>();
  const players: FaceitMatchRosterPlayer[] = [];

  for (const player of [
    ...(block.roster ?? []),
    ...(block.roster_v1 ?? []),
  ]) {
    const id = player.player_id?.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    players.push(player);
  }

  return players;
}

function sortPlayers(
  players: FaceitMatchRosterPlayer[],
  leaderId: string | null | undefined,
): FaceitMatchRosterPlayer[] {
  if (!leaderId) return players;

  const leaderIndex = players.findIndex(
    (player) => player.player_id === leaderId,
  );
  if (leaderIndex <= 0) return players;

  const sorted = [...players];
  const [leader] = sorted.splice(leaderIndex, 1);
  if (leader) {
    sorted.unshift(leader);
  }
  return sorted;
}

function computeKd(
  kills: number | null,
  deaths: number | null,
): number | null {
  if (kills === null || deaths === null) return null;
  if (deaths > 0) return kills / deaths;
  return kills;
}

function buildPlayerRow(params: {
  rosterPlayer: FaceitMatchRosterPlayer;
  leaderId: string | null | undefined;
  viewerFaceitPlayerId: string;
  stats: ReturnType<typeof mergePlayerStatsFromRounds>;
}): Cs2FaceitMatchDetailsPlayer {
  const { rosterPlayer, leaderId, viewerFaceitPlayerId, stats } = params;
  const playerId = rosterPlayer.player_id;
  const agg = stats.get(playerId);
  const kills = agg?.kills ?? null;
  const deaths = agg?.deaths ?? null;
  const assists = agg?.assists ?? null;

  return {
    playerId,
    nickname:
      rosterPlayer.nickname?.trim() ||
      rosterPlayer.game_player_name?.trim() ||
      "Unknown",
    avatar: rosterPlayer.avatar?.trim() || null,
    skillLevel:
      typeof rosterPlayer.game_skill_level === "number" &&
      Number.isFinite(rosterPlayer.game_skill_level)
        ? rosterPlayer.game_skill_level
        : null,
    isCaptain: leaderId === playerId,
    isViewer: viewerFaceitPlayerId === playerId,
    kills,
    deaths,
    assists,
    kd: computeKd(kills, deaths),
  };
}

export async function getCs2FaceitMatchDetails(input: {
  matchId: string;
  gameAccountId: string;
}): Promise<Cs2FaceitMatchDetails> {
  const account = await findGameAccountById(input.gameAccountId);

  if (!account || account.gameId !== GAMES.CS2_FACEIT) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Game account not found",
    });
  }

  const participant = await db.query.cs2FaceitMatchPlayers.findFirst({
    where: and(
      eq(cs2FaceitMatchPlayers.matchId, input.matchId),
      eq(cs2FaceitMatchPlayers.gameAccountId, input.gameAccountId),
    ),
  });

  if (!participant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Match participant not found",
    });
  }

  const matchRow = await db.query.matches.findFirst({
    where: and(
      eq(matches.id, input.matchId),
      eq(matches.gameId, GAMES.CS2_FACEIT),
    ),
  });

  if (!matchRow) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Match not found",
    });
  }

  const detail = await getFaceitMatch(matchRow.externalMatchId);
  if (!detail) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "FACEIT match not found",
    });
  }

  let statsPayload: FaceitMatchStatsPayload | null = null;
  try {
    statsPayload = await getFaceitMatchStats(matchRow.externalMatchId);
  } catch {
    statsPayload = null;
  }

  const mergedStats = mergePlayerStatsFromRounds(statsPayload);
  const winningTeam = resolveFaceitWinningTeamOneBased(detail);
  const teamEntries = Object.entries(detail.teams ?? {});
  const [team1Score, team2Score] = teamScoresFromDetail(detail);
  const mapName =
    matchRow.mapName ?? resolveFaceitMapName(detail, statsPayload);
  const viewerFaceitPlayerId = account.externalId.trim();
  if (participant.team !== 1 && participant.team !== 2) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Invalid team number: ${participant.team}`,
    });
  }
  const viewerTeam = participant.team;

  const teams: Cs2FaceitMatchDetails["teams"][number][] = teamEntries
    .slice(0, 2)
    .map(([, block], index) => {
      const teamNumber = (index + 1) as 1 | 2;
      const score = teamNumber === 1 ? team1Score : team2Score;
      const won = winningTeam === teamNumber;
      const leaderId = block.leader?.trim();
      const players = sortPlayers(rosterPlayers(block), leaderId).map(
        (rosterPlayer) =>
          buildPlayerRow({
            rosterPlayer,
            leaderId,
            viewerFaceitPlayerId,
            stats: mergedStats,
          }),
      );

      return {
        name: block.name?.trim() || `Team ${teamNumber}`,
        avatar: block.avatar?.trim() || null,
        score,
        won,
        players,
      };
    });

  while (teams.length < 2) {
    const teamNumber = teams.length + 1;
    teams.push({
      name: `Team ${teamNumber}`,
      avatar: null,
      score: teamNumber === 1 ? team1Score : team2Score,
      won: winningTeam === teamNumber,
      players: [],
    });
  }

  const teamOne = teams[0] ?? {
    name: "Team 1",
    avatar: null,
    score: team1Score,
    won: winningTeam === 1,
    players: [],
  };
  const teamTwo = teams[1] ?? {
    name: "Team 2",
    avatar: null,
    score: team2Score,
    won: winningTeam === 2,
    players: [],
  };

  return {
    summary: {
      mapName,
      mapLabel: formatMapDisplayName(mapName),
      playedAt: matchRow.playedAt,
      team1Score,
      team2Score,
      matchTypeLabel: detail.competition_name?.trim() || null,
      queueLabel: formatQueueLabel(detail.region),
      serverLabel: parseServerLabel(statsPayload),
    },
    viewerTeam,
    teams: [teamOne, teamTwo],
  };
}
