export type FaceitPlayer = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
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
