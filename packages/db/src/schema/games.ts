import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const GAMES = {
	LOL: "lol",
	CS2_FACEIT: "cs2_faceit",
} as const;

export type GameId = (typeof GAMES)[keyof typeof GAMES];

export const GAME_IDS = Object.values(GAMES) as [GameId, ...GameId[]];

const RIOT_REGIONAL_ROUTE = ["americas", "europe", "asia", "sea"] as const;
const RIOT_PLATFORM_ROUTE = [
	"br1",
	"eun1",
	"euw1",
	"jp1",
	"kr",
	"la1",
	"la2",
	"me1",
	"na1",
	"oc1",
	"ru",
	"sg2",
	"tr1",
	"tw2",
	"vn2",
] as const;
const regionalRouteEnum = pgEnum("regional_route", RIOT_REGIONAL_ROUTE);
const platformRouteEnum = pgEnum("platform_route", RIOT_PLATFORM_ROUTE);

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
			columns: [table.gameAccountId],
			foreignColumns: [gameAccounts.id],
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
			columns: [table.gameAccountId],
			foreignColumns: [gameAccounts.id],
			name: "cs2_faceit_game_account_profiles_game_account_faceit_fk",
		}).onDelete("cascade"),
	],
);
