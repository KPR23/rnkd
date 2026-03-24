import type { games, gameAccounts } from "@repo/db";

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

export type GameAccount = typeof gameAccounts.$inferSelect;
export type GameAccountInsert = typeof gameAccounts.$inferInsert;
export type GameAccounts = {
	lol: GameAccount[];
	faceit: GameAccount[];
};
