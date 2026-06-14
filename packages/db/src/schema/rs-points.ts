import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { gameAccounts } from "./games";

export const RS_POINT_SOURCES = {
  CS2_FACEIT_ELO: "cs2_faceit_elo",
  LOL_RANKED_SOLO: "lol_ranked_solo",
  LOL_RANKED_FLEX: "lol_ranked_flex",
} as const;

export type RsPointSourceKey =
  (typeof RS_POINT_SOURCES)[keyof typeof RS_POINT_SOURCES];

export const gameAccountRsPoints = pgTable(
  "game_account_rs_points",
  {
    gameAccountId: text("game_account_id").notNull(),
    sourceKey: text("source_key").notNull(),
    gameId: text("game_id").notNull(),
    points: integer("points").notNull().default(0),
    computedAt: timestamp("computed_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.gameAccountId, table.sourceKey] }),
    foreignKey({
      columns: [table.gameAccountId],
      foreignColumns: [gameAccounts.id],
      name: "game_account_rs_points_game_account_fk",
    }).onDelete("cascade"),
    index("game_account_rs_points_account_idx").on(table.gameAccountId),
    index("game_account_rs_points_game_idx").on(table.gameId),
  ],
);
