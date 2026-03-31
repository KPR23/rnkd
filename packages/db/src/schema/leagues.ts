import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { gameAccounts } from "./games";

export const leagues = pgTable("leagues", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const leagueMembers = pgTable(
	"league_members",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		leagueId: text("league_id")
			.notNull()
			.references(() => leagues.id, { onDelete: "cascade" }),
		gameAccountId: text("game_account_id")
			.notNull()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("league_members_league_account_unique").on(
			table.leagueId,
			table.gameAccountId,
		),
		index("league_members_league_idx").on(table.leagueId),
		index("league_members_account_idx").on(table.gameAccountId),
	],
);

export const leagueRankings = pgTable(
	"league_rankings",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		leagueId: text("league_id")
			.notNull()
			.references(() => leagues.id, { onDelete: "cascade" }),
		gameAccountId: text("game_account_id")
			.notNull()
			.references(() => gameAccounts.id, { onDelete: "cascade" }),
		score: integer("score").notNull(),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("league_rankings_league_idx").on(table.leagueId),
		uniqueIndex("league_rankings_league_account_unique").on(
			table.leagueId,
			table.gameAccountId,
		),
		uniqueIndex("league_rankings_league_position_unique").on(
			table.leagueId,
			table.position,
		),
	],
);
