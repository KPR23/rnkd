import type {
  cs2FaceitGameAccountProfiles,
  cs2FaceitMatchPlayers,
  gameAccounts,
  games,
  lolGameAccountProfiles,
  matches,
  matchParticipants,
} from "@repo/db";

export const GAMES = {
  LOL: "lol",
  CS2_FACEIT: "cs2_faceit",
} as const;

export type GameId = (typeof GAMES)[keyof typeof GAMES];

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;

export type GameFromList = {
  id: GameId;
  name: string;
};

export type GameAccountRow = typeof gameAccounts.$inferSelect;
export type GameAccountInsert = typeof gameAccounts.$inferInsert;

export type LolGameAccountProfile = typeof lolGameAccountProfiles.$inferSelect;
export type Cs2FaceitGameAccountProfile =
  typeof cs2FaceitGameAccountProfiles.$inferSelect;

export type LolGameAccount = Omit<GameAccountRow, "gameId"> & {
  gameId: typeof GAMES.LOL;
  profile: LolGameAccountProfile;
};

export type Cs2FaceitGameAccount = Omit<GameAccountRow, "gameId"> & {
  gameId: typeof GAMES.CS2_FACEIT;
  profile: Cs2FaceitGameAccountProfile | null;
};

export type GameAccount = LolGameAccount | Cs2FaceitGameAccount;

export type GameAccounts = {
  lol: LolGameAccount[];
  faceit: Cs2FaceitGameAccount[];
};

export function isLolGameAccount(
  gameAccount: GameAccount,
): gameAccount is LolGameAccount {
  return gameAccount.gameId === GAMES.LOL;
}

export function isCs2FaceitGameAccount(
  gameAccount: GameAccount,
): gameAccount is Cs2FaceitGameAccount {
  return gameAccount.gameId === GAMES.CS2_FACEIT;
}

export type LolMatchHistoryRow = {
  matches: typeof matches.$inferSelect;
  match_participants: typeof matchParticipants.$inferSelect;
};

export type LolMatchHistory = LolMatchHistoryRow[];

export type Cs2FaceitMatchHistoryRow = {
  matches: typeof matches.$inferSelect;
  cs2_faceit_match_players: typeof cs2FaceitMatchPlayers.$inferSelect;
};

export type Cs2FaceitMatchHistory = Cs2FaceitMatchHistoryRow[];

export type Cs2FaceitMatchDetailsPlayer = {
  playerId: string;
  nickname: string;
  avatar: string | null;
  skillLevel: number | null;
  isCaptain: boolean;
  isViewer: boolean;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  kd: number | null;
};

export type Cs2FaceitMatchDetailsTeam = {
  name: string;
  avatar: string | null;
  score: number;
  won: boolean;
  players: Cs2FaceitMatchDetailsPlayer[];
};

export type Cs2FaceitMatchDetails = {
  summary: {
    mapName: string | null;
    mapLabel: string;
    playedAt: Date;
    team1Score: number;
    team2Score: number;
    matchTypeLabel: string | null;
    queueLabel: string;
    serverLabel: string | null;
  };
  viewerTeam: 1 | 2;
  teams: [Cs2FaceitMatchDetailsTeam, Cs2FaceitMatchDetailsTeam];
};
