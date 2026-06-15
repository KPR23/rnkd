import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const pushTokens = pgTable(
  "push_tokens",
  {
    token: text("token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    deviceId: text("device_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("push_tokens_user_id_idx").on(table.userId)],
);
