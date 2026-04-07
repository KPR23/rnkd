import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import {
	cs2FaceitGameAccountProfiles,
	gameAccounts,
	games,
	lolGameAccountProfiles,
} from "./games";
import { leagueMembers, leagueRankings, leagues } from "./leagues";
import { lolRankedEntries } from "./lol-ranked";
import {
	eloHistory,
	follows,
	matchParticipants,
	matches,
	playerStats,
} from "./matches";

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
		game: one(games, {
			fields: [gameAccounts.gameId],
			references: [games.id],
		}),
		lolProfile: one(lolGameAccountProfiles, {
			fields: [gameAccounts.id, gameAccounts.gameId],
			references: [lolGameAccountProfiles.gameAccountId, lolGameAccountProfiles.gameId],
		}),
		cs2FaceitProfile: one(cs2FaceitGameAccountProfiles, {
			fields: [gameAccounts.id, gameAccounts.gameId],
			references: [
				cs2FaceitGameAccountProfiles.gameAccountId,
				cs2FaceitGameAccountProfiles.gameId,
			],
		}),
		matchParticipants: many(matchParticipants),
		eloHistory: many(eloHistory),
		lolRankedEntries: many(lolRankedEntries),
		playerStats: one(playerStats),
		follows: many(follows),
	}),
);

export const lolGameAccountProfileRelations = relations(
	lolGameAccountProfiles,
	({ one }) => ({
		account: one(gameAccounts, {
			fields: [lolGameAccountProfiles.gameAccountId, lolGameAccountProfiles.gameId],
			references: [gameAccounts.id, gameAccounts.gameId],
		}),
	}),
);

export const cs2FaceitGameAccountProfileRelations = relations(
	cs2FaceitGameAccountProfiles,
	({ one }) => ({
		account: one(gameAccounts, {
			fields: [
				cs2FaceitGameAccountProfiles.gameAccountId,
				cs2FaceitGameAccountProfiles.gameId,
			],
			references: [gameAccounts.id, gameAccounts.gameId],
		}),
	}),
);

export const lolRankedEntriesRelations = relations(
	lolRankedEntries,
	({ one }) => ({
		account: one(gameAccounts, {
			fields: [lolRankedEntries.gameAccountId, lolRankedEntries.gameId],
			references: [gameAccounts.id, gameAccounts.gameId],
		}),
	}),
);

export const matchRelations = relations(matches, ({ one, many }) => ({
	game: one(games, {
		fields: [matches.gameId],
		references: [games.id],
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

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
	account: one(gameAccounts, {
		fields: [playerStats.gameAccountId],
		references: [gameAccounts.id],
	}),
}));

export const eloHistoryRelations = relations(eloHistory, ({ one }) => ({
	account: one(gameAccounts, {
		fields: [eloHistory.gameAccountId],
		references: [gameAccounts.id],
	}),
	match: one(matches, {
		fields: [eloHistory.matchId],
		references: [matches.id],
	}),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	account: one(gameAccounts, {
		fields: [follows.gameAccountId],
		references: [gameAccounts.id],
	}),
	follower: one(user, {
		fields: [follows.followerUserId],
		references: [user.id],
	}),
}));

export const leagueRelations = relations(leagues, ({ one, many }) => ({
	owner: one(user, {
		fields: [leagues.ownerId],
		references: [user.id],
	}),
	members: many(leagueMembers),
	rankings: many(leagueRankings),
}));

export const leagueMembersRelations = relations(leagueMembers, ({ one }) => ({
	league: one(leagues, {
		fields: [leagueMembers.leagueId],
		references: [leagues.id],
	}),
	account: one(gameAccounts, {
		fields: [leagueMembers.gameAccountId],
		references: [gameAccounts.id],
	}),
}));

export const leagueRankingsRelations = relations(leagueRankings, ({ one }) => ({
	league: one(leagues, {
		fields: [leagueRankings.leagueId],
		references: [leagues.id],
	}),
	account: one(gameAccounts, {
		fields: [leagueRankings.gameAccountId],
		references: [gameAccounts.id],
	}),
}));

export const gameRelations = relations(games, ({ many }) => ({
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
