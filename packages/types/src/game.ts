import type { games, GameId } from "@repo/db";

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export type { GameId };
