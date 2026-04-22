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
} from "drizzle-orm/pg-core";

import { gameAccounts, GAMES } from "./games";

export const cs2FaceitRankedEntries = pgTable(
  "cs2_faceit_ranked_entries",
  {
    gameAccountId: text("game_account_id").notNull(),
    gameId: text("game_id").notNull().default(GAMES.CS2_FACEIT),
    gameKey: text("game_key").notNull(),
    faceitElo: integer("faceit_elo"),
    skillLevel: integer("skill_level"),
    region: text("region"),
    gamePlayerId: text("game_player_id"),
    gamePlayerName: text("game_player_name"),
    syncedAt: timestamp("synced_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.gameAccountId, table.gameKey] }),
    check(
      "cs2_faceit_ranked_entries_game_id_is_cs2_faceit",
      sql`${table.gameId} = 'cs2_faceit'`,
    ),
    foreignKey({
      columns: [table.gameAccountId],
      foreignColumns: [gameAccounts.id],
      name: "cs2_faceit_ranked_entries_game_account_fk",
    }).onDelete("cascade"),
    index("cs2_faceit_ranked_entries_account_idx").on(table.gameAccountId),
    index("cs2_faceit_ranked_entries_synced_idx").on(table.syncedAt),
  ],
);
