import { relations } from "drizzle-orm";

import { account, session, user } from "./auth";
import { cs2FaceitMatchPlayers } from "./cs2-faceit-match-players";
import { cs2FaceitRankedEntries } from "./cs2-faceit-ranked";
import {
  cs2FaceitGameAccountProfiles,
  gameAccounts,
  games,
  lolGameAccountProfiles,
} from "./games";
import { groupMembers, groups } from "./groups";
import { leagueMembers, leagueRankings, leagues } from "./leagues";
import { lolRankedEntries } from "./lol-ranked";
import {
  eloHistory,
  matches,
  matchParticipants,
  playerStats,
} from "./matches";
import { friendships } from "./social";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  gameAccounts: many(gameAccounts),
  friendshipsInitiated: many(friendships, {
    relationName: "friendshipsRequester",
  }),
  friendshipsReceived: many(friendships, {
    relationName: "friendshipsAddressee",
  }),
  ownedGroups: many(groups),
  groupMemberships: many(groupMembers),
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
      fields: [gameAccounts.id],
      references: [lolGameAccountProfiles.gameAccountId],
    }),
    cs2FaceitProfile: one(cs2FaceitGameAccountProfiles, {
      fields: [gameAccounts.id],
      references: [cs2FaceitGameAccountProfiles.gameAccountId],
    }),
    cs2FaceitRankedEntries: many(cs2FaceitRankedEntries),
    matchParticipants: many(matchParticipants),
    cs2FaceitMatchPlayers: many(cs2FaceitMatchPlayers),
    eloHistory: many(eloHistory),
    lolRankedEntries: many(lolRankedEntries),
    playerStats: one(playerStats),
  }),
);

export const lolGameAccountProfileRelations = relations(
  lolGameAccountProfiles,
  ({ one }) => ({
    account: one(gameAccounts, {
      fields: [lolGameAccountProfiles.gameAccountId],
      references: [gameAccounts.id],
    }),
  }),
);

export const cs2FaceitGameAccountProfileRelations = relations(
  cs2FaceitGameAccountProfiles,
  ({ one }) => ({
    account: one(gameAccounts, {
      fields: [cs2FaceitGameAccountProfiles.gameAccountId],
      references: [gameAccounts.id],
    }),
  }),
);

export const cs2FaceitRankedEntriesRelations = relations(
  cs2FaceitRankedEntries,
  ({ one }) => ({
    account: one(gameAccounts, {
      fields: [cs2FaceitRankedEntries.gameAccountId],
      references: [gameAccounts.id],
    }),
  }),
);

export const lolRankedEntriesRelations = relations(
  lolRankedEntries,
  ({ one }) => ({
    account: one(gameAccounts, {
      fields: [lolRankedEntries.gameAccountId],
      references: [gameAccounts.id],
    }),
  }),
);

export const matchRelations = relations(matches, ({ one, many }) => ({
  game: one(games, {
    fields: [matches.gameId],
    references: [games.id],
  }),
  participants: many(matchParticipants),
  cs2FaceitMatchPlayers: many(cs2FaceitMatchPlayers),
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

export const cs2FaceitMatchPlayersRelations = relations(
  cs2FaceitMatchPlayers,
  ({ one }) => ({
    match: one(matches, {
      fields: [cs2FaceitMatchPlayers.matchId],
      references: [matches.id],
    }),
    account: one(gameAccounts, {
      fields: [cs2FaceitMatchPlayers.gameAccountId],
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

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(user, {
    fields: [friendships.requesterUserId],
    references: [user.id],
    relationName: "friendshipsRequester",
  }),
  addressee: one(user, {
    fields: [friendships.addresseeUserId],
    references: [user.id],
    relationName: "friendshipsAddressee",
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(user, {
    fields: [groups.ownerUserId],
    references: [user.id],
  }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(user, {
    fields: [groupMembers.userId],
    references: [user.id],
  }),
  invitedBy: one(user, {
    fields: [groupMembers.invitedByUserId],
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
