import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	foreignKey,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { platformRouteEnum, regionalRouteEnum } from "./riot-enums";

export const GAMES = {
	LOL: "lol",
	CS2_FACEIT: "cs2_faceit",
} as const;

export type GameId = (typeof GAMES)[keyof typeof GAMES];

export const GAME_IDS = Object.values(GAMES) as [GameId, ...GameId[]];

export const games = pgTable("games", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const gameAccounts = pgTable(
	"game_accounts",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
		gameId: text("game_id")
			.notNull()
			.references(() => games.id, { onDelete: "cascade" }),
		externalId: text("external_id").notNull(),
		lastSyncedAt: timestamp("last_synced_at"),
		isTracked: boolean("is_tracked").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("game_accounts_game_external_unique").on(
			table.gameId,
			table.externalId,
		),
		uniqueIndex("game_accounts_id_game_id_unique").on(table.id, table.gameId),
		index("game_accounts_user_idx").on(table.userId),
		index("game_accounts_last_synced_idx").on(table.lastSyncedAt),
	],
);

export const lolGameAccountProfiles = pgTable(
	"lol_game_account_profiles",
	{
		gameAccountId: text("game_account_id").primaryKey(),
		gameId: text("game_id").notNull().default(GAMES.LOL),
		gameName: text("game_name").notNull(),
		tagLine: text("tag_line").notNull(),
		profileIconId: integer("profile_icon_id").notNull(),
		summonerLevel: integer("summoner_level").notNull(),
		regionalRoute: regionalRouteEnum("regional_route").notNull(),
		platformRoute: platformRouteEnum("platform_route").notNull(),
		lastMatchId: text("last_match_id"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		check(
			"lol_game_account_profiles_game_id_is_lol",
			sql`${table.gameId} = 'lol'`,
		),
		foreignKey({
			columns: [table.gameAccountId, table.gameId],
			foreignColumns: [gameAccounts.id, gameAccounts.gameId],
			name: "lol_game_account_profiles_game_account_lol_fk",
		}).onDelete("cascade"),
		index("lol_game_account_profiles_platform_idx").on(table.platformRoute),
	],
);

export const cs2FaceitGameAccountProfiles = pgTable(
	"cs2_faceit_game_account_profiles",
	{
		gameAccountId: text("game_account_id").primaryKey(),
		gameId: text("game_id").notNull().default(GAMES.CS2_FACEIT),
		faceitNickname: text("faceit_nickname"),
		steamNickname: text("steam_nickname"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		check(
			"cs2_faceit_game_account_profiles_game_id_is_cs2_faceit",
			sql`${table.gameId} = 'cs2_faceit'`,
		),
		foreignKey({
			columns: [table.gameAccountId, table.gameId],
			foreignColumns: [gameAccounts.id, gameAccounts.gameId],
			name: "cs2_faceit_game_account_profiles_game_account_faceit_fk",
		}).onDelete("cascade"),
	],
);
