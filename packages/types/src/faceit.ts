export type FaceitPlayer = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  faceit_url: string;
  skill_level: number;
  games: Record<string, FaceitGameInfo>;
  membership_type: string;
};

export type FaceitGameInfo = {
  faceit_elo: number;
  skill_level: number;
  game_player_id: string;
  game_player_name: string;
  region: string;
};
