import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterUserId: text("requester_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    addresseeUserId: text("addressee_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("friendships_requester_addressee_unique").on(
      table.requesterUserId,
      table.addresseeUserId,
    ),
    index("friendships_addressee_status_idx").on(
      table.addresseeUserId,
      table.status,
    ),
    index("friendships_requester_status_idx").on(
      table.requesterUserId,
      table.status,
    ),
    check(
      "friendships_no_self",
      sql`${table.requesterUserId} <> ${table.addresseeUserId}`,
    ),
  ],
);
