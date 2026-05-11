import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { gameAccounts } from "./games";
import { matches } from "./matches";

export const cs2FaceitMatchPlayers = pgTable(
  "cs2_faceit_match_players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    gameAccountId: text("game_account_id")
      .notNull()
      .references(() => gameAccounts.id, { onDelete: "cascade" }),
    team: integer("team").notNull(),
    win: boolean("win").notNull(),
    kills: integer("kills"),
    deaths: integer("deaths"),
    assists: integer("assists"),
    adr: real("adr"),
    headshotPct: real("headshot_pct"),
    rawStats:
      jsonb("raw_stats").$type<Record<string, string | number | null>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cs2_faceit_match_players_match_account_unique").on(
      table.matchId,
      table.gameAccountId,
    ),
    index("cs2_faceit_match_players_match_idx").on(table.matchId),
    index("cs2_faceit_match_players_account_idx").on(table.gameAccountId),
    check(
      "cs2_faceit_match_players_kills_nonnegative",
      sql`${table.kills} >= 0`,
    ),
    check(
      "cs2_faceit_match_players_deaths_nonnegative",
      sql`${table.deaths} >= 0`,
    ),
    check(
      "cs2_faceit_match_players_assists_nonnegative",
      sql`${table.assists} >= 0`,
    ),
    check("cs2_faceit_match_players_adr_nonnegative", sql`${table.adr} >= 0`),
    check(
      "cs2_faceit_match_players_headshot_pct_range",
      sql`${table.headshotPct} between 0 and 100`,
    ),
  ],
);
