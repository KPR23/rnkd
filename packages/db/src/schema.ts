import { relations } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	integer,
	uniqueIndex,
	real,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const game = pgTable("game", {
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
			.references(() => game.id, { onDelete: "cascade" }),
		externalId: text("external_id").notNull(),

		region: text("region"),
		lastSyncedAt: timestamp("last_synced_at"),
		lastMatchId: text("last_match_id"),
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

export const follows = pgTable(
	"follows",
	{
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
			.references(() => game.id, { onDelete: "cascade" }),
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

export const playersStats = pgTable(
	"players_stats",
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

export const league = pgTable("league", {
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
		leagueId: text("league_id")
			.notNull()
			.references(() => league.id, { onDelete: "cascade" }),
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
		leagueId: text("league_id")
			.notNull()
			.references(() => league.id, { onDelete: "cascade" }),
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

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	gameAccounts: many(gameAccounts),
}));

export const gameAccountRelations = relations(
	gameAccounts,
	({ one, many }) => ({
		user: one(user, {
			fields: [gameAccounts.userId],
			references: [user.id],
		}),
		game: one(game, {
			fields: [gameAccounts.gameId],
			references: [game.id],
		}),
		matchParticipants: many(matchParticipants),
		eloHistory: many(eloHistory),
	}),
);

export const matchRelations = relations(matches, ({ one, many }) => ({
	game: one(game, {
		fields: [matches.gameId],
		references: [game.id],
	}),
	participants: many(matchParticipants),
}));

export const matchParticipantRelations = relations(
	matchParticipants,
	({ one }) => ({
		match: one(matches, {
			fields: [matchParticipants.matchId],
			references: [matches.id],
		}),
		account: one(gameAccounts, {
			fields: [matchParticipants.gameAccountId],
			references: [gameAccounts.id],
		}),
	}),
);

export const leagueRelations = relations(league, ({ one, many }) => ({
	owner: one(user, {
		fields: [league.ownerId],
		references: [user.id],
	}),
	members: many(leagueMembers),
	rankings: many(leagueRankings),
}));

export const leagueMembersRelations = relations(leagueMembers, ({ one }) => ({
	league: one(league, {
		fields: [leagueMembers.leagueId],
		references: [league.id],
	}),
	account: one(gameAccounts, {
		fields: [leagueMembers.gameAccountId],
		references: [gameAccounts.id],
	}),
}));

export const leagueRankingsRelations = relations(leagueRankings, ({ one }) => ({
	league: one(league, {
		fields: [leagueRankings.leagueId],
		references: [league.id],
	}),
	account: one(gameAccounts, {
		fields: [leagueRankings.gameAccountId],
		references: [gameAccounts.id],
	}),
}));

export const gameRelations = relations(game, ({ many }) => ({
	accounts: many(gameAccounts),
	matches: many(matches),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));
