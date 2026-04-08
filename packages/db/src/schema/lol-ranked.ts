import { sql } from "drizzle-orm";
import {
	check,
	foreignKey,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	boolean,
} from "drizzle-orm/pg-core";
import { GAMES, gameAccounts } from "./games";

export const lolRankedEntries = pgTable(
	"lol_ranked_entries",
	{
		gameAccountId: text("game_account_id").notNull(),
		gameId: text("game_id").notNull().default(GAMES.LOL),
		queueType: text("queue_type").notNull(),
		tier: text("tier").notNull(),
		rank: text("rank"),
		leaguePoints: integer("league_points").notNull(),
		wins: integer("wins").notNull(),
		losses: integer("losses").notNull(),
		hotStreak: boolean("hot_streak").default(false).notNull(),
		inactive: boolean("inactive").default(false).notNull(),
		syncedAt: timestamp("synced_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.gameAccountId, table.queueType] }),
		check("lol_ranked_entries_game_id_is_lol", sql`${table.gameId} = 'lol'`),
		foreignKey({
			columns: [table.gameAccountId],
			foreignColumns: [gameAccounts.id],
			name: "lol_ranked_entries_game_account_lol_fk",
		}).onDelete("cascade"),
		index("lol_ranked_entries_account_idx").on(table.gameAccountId),
		index("lol_ranked_entries_synced_idx").on(table.syncedAt),
	],
);
