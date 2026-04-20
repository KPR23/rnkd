import type { GameId } from "./game";

export const SEARCH_PROFILE_KINDS = ["player", "team", "game"] as const;

export type SearchProfileKind = (typeof SEARCH_PROFILE_KINDS)[number];

export const SEARCH_PROFILE_LABELS: Record<SearchProfileKind, string> = {
  player: "Player",
  team: "Team",
  game: "Game",
};

export type SearchUserGame = {
  gameId: GameId;
  displayLabel: string;
};

export type SearchPlayerResult = {
  type: "player";
  id: string;
  name: string;
  tag: string | null;
  image: string | null;
  games: SearchUserGame[];
};

export type SearchTeamResult = {
  type: "team";
  id: string;
  name: string;
  tag: string | null;
  image: string | null;
};

export type SearchGameResult = {
  type: "game";
  id: GameId;
  name: string;
};

export type SearchResult =
  | SearchPlayerResult
  | SearchTeamResult
  | SearchGameResult;
