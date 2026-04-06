export const SEARCH_PROFILE_KINDS = ["player", "team", "game"] as const;

export type SearchProfileKind = (typeof SEARCH_PROFILE_KINDS)[number];

export const SEARCH_PROFILE_LABELS: Record<SearchProfileKind, string> = {
	player: "Player",
	team: "Team",
	game: "Game",
};
