import type { games, GameId, gameAccounts } from "@repo/db";

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export type { GameId };

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
