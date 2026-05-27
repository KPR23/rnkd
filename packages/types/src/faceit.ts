export type FaceitPlayer = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  friends_ids?: string[];
  games: Record<string, FaceitGameInfo>;
  membership_type: string;
  steam_nickname?: string;
  verified: boolean;
  activated_at?: string;
};

export type FaceitGameInfo = {
  faceit_elo: number;
  skill_level: number;
  game_player_id: string;
  game_player_name: string;
  region: string;
};

export type FaceitSuggestedPlayer = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  steam_nickname?: string;
  games: Record<string, FaceitGameInfo>;
};

export type FaceitHistoryItem = {
  match_id: string;
  game_id?: string;
  started_at?: number;
  finished_at?: number;
};

export type FaceitHistoryResponse = {
  items: FaceitHistoryItem[];
  start?: number;
  end?: number;
  from?: number;
  to?: number;
};

export type FaceitMatchRosterPlayer = {
  player_id: string;
  nickname?: string;
  game_player_name?: string;
};

export type FaceitMatchTeamBlock = {
  roster?: FaceitMatchRosterPlayer[];
  roster_v1?: FaceitMatchRosterPlayer[] | null;
};

export type FaceitMapEntity = {
  game_map_id?: string;
  guid?: string;
  image_lg?: string;
  image_sm?: string;
  name?: string;
};

export type FaceitMatchDetail = {
  match_id: string;
  game?: string;
  started_at?: number;
  finished_at?: number;
  results?: {
    winner?: string;
    score?: Record<string, number>;
  };
  voting_map?: {
    entity?: FaceitMapEntity;
    pick?: string[];
  };
  teams?: Record<string, FaceitMatchTeamBlock>;
};

export type FaceitRoundPlayer = {
  nickname?: string | null;
  player_id?: string | null;
  player_stats?: Record<string, string | number | null | undefined> | null;
};

export type FaceitRoundTeam = {
  team_id?: string | null;
  players?: FaceitRoundPlayer[] | null;
};

export type FaceitRoundStats = {
  round_stats?: Record<string, string | null> | null;
  teams?: FaceitRoundTeam[] | null;
};

export type FaceitMatchStatsPayload = {
  rounds?: FaceitRoundStats[] | null;
};
