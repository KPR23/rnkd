import { matches, matchParticipants } from "@repo/db";

export const RIOT_REGIONS = ["americas", "europe", "asia", "sea"] as const;
export type RiotRegion = (typeof RIOT_REGIONS)[number];

export const RIOT_QUEUE_IDS = [
	400, 420, 430, 440, 450, 700, 720, 900, 1400, 1700, 1900, 2000, 2010, 2020,
] as const;
export type QueueType = (typeof RIOT_QUEUE_IDS)[number];

export type MatchResponse = {
	metadata: {
		dataVersion: string;
		matchId: string;
		participants: string[];
	};
	info: {
		endOfGameResult: string;
		gameCreation: number;
		gameDuration: number;
		gameEndTimestamp: number;
		gameId: number;
		gameMode: string;
		gameName: string;
		gameStartTimestamp: number;
		gameType: string;
		gameVersion: string;
		mapId: number;
		platformId: string;
		queueId: number;
		tournamentCode: string;
		participants: RiotParticipant[];
		teams: RiotTeam[];
	};
};

export type RiotParticipant = {
	puuid: string;
	teamId: number;
	win: boolean;
	kills: number;
	deaths: number;
	assists: number;
	championId: number;
	championName: string;
	teamPosition: string;
	individualPosition: string;
	timePlayed: number;
	[key: string]: unknown;
};

export type RiotTeam = {
	teamId: number;
	win: boolean;
	bans: {
		championId: number;
		pickTurn: number;
	}[];
	objectives: {
		champion?: {
			first: boolean;
			kills: number;
		};
		dragon?: {
			first: boolean;
			kills: number;
		};
		tower?: {
			first: boolean;
			kills: number;
		};
		[key: string]:
			| {
					first: boolean;
					kills: number;
			  }
			| undefined;
	};
};

export type Match = typeof matches.$inferSelect;

export type MatchParticipant = typeof matchParticipants.$inferSelect;

export type MatchParticipantInsert = typeof matchParticipants.$inferInsert;
