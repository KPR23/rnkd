import {
	boolean,
	index,
	integer,
	pgTable,
	real,
	text,
	timestamp,
	uuid,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { gameAccounts, games } from "./games";

export const follows = pgTable(
	"follows",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		followerUserId: text("follower_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		gameAccountId: text("game_account_id")
			.notNull()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("follows_follower_account_unique").on(
			table.followerUserId,
			table.gameAccountId,
		),
		index("follows_follower_idx").on(table.followerUserId),
		index("follows_game_account_idx").on(table.gameAccountId),
	],
);

export const matches = pgTable(
	"matches",
	{
		id: text("id").primaryKey(),
		gameId: text("game_id")
			.notNull()
			.references(() => games.id, { onDelete: "cascade" }),
		externalMatchId: text("external_match_id").notNull(),
		team1Score: integer("team1_score").notNull(),
		team2Score: integer("team2_score").notNull(),
		playedAt: timestamp("played_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("matches_game_idx").on(table.gameId),
		index("matches_played_at_idx").on(table.playedAt),
		uniqueIndex("matches_game_external_unique").on(
			table.gameId,
			table.externalMatchId,
		),
	],
);

export const matchParticipants = pgTable(
	"match_participants",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		matchId: text("match_id")
			.notNull()
			.references(() => matches.id, { onDelete: "cascade" }),
		gameAccountId: text("game_account_id")
			.notNull()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		team: integer("team").notNull(),
		partyId: text("party_id"),
		win: boolean("win").notNull(),
		kills: integer("kills").notNull(),
		deaths: integer("deaths").notNull(),
		assists: integer("assists").notNull(),
		eloBefore: integer("elo_before").notNull(),
		eloAfter: integer("elo_after").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("match_participants_match_account_unique").on(
			table.matchId,
			table.gameAccountId,
		),
		index("participants_match_idx").on(table.matchId),
		index("participants_account_idx").on(table.gameAccountId),
	],
);

export const playerStats = pgTable(
	"player_stats",
	{
		gameAccountId: text("game_account_id")
			.notNull()
			.unique()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		totalMatches: integer("total_matches").notNull(),
		totalWins: integer("total_wins").notNull(),
		winRate: real("win_rate").notNull(),
		currentElo: integer("current_elo").notNull(),
		avg_kills: real("avg_kills").notNull(),
		avg_deaths: real("avg_deaths").notNull(),
		avg_assists: real("avg_assists").notNull(),
		lastCalculatedAt: timestamp("last_calculated_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("players_stats_account_idx").on(table.gameAccountId)],
);

export const eloHistory = pgTable(
	"elo_history",
	{
		id: text("id").primaryKey(),
		matchId: text("match_id").references(() => matches.id, {
			onDelete: "cascade",
		}),
		gameAccountId: text("game_account_id")
			.notNull()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		elo: integer("elo").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("elo_history_account_time_idx").on(
			table.gameAccountId,
			table.createdAt,
		),
	],
);
