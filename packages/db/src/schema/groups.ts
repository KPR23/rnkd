import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "owner",
  "member",
]);

export const groupMemberStatusEnum = pgEnum("group_member_status", [
  "active",
  "invited",
]);

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    inviteCode: text("invite_code").notNull(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("groups_name_unique").on(sql`lower(${table.name})`),
    uniqueIndex("groups_invite_code_unique").on(table.inviteCode),
    index("groups_owner_idx").on(table.ownerUserId),
  ],
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: groupMemberRoleEnum("role").notNull().default("member"),
    status: groupMemberStatusEnum("status").notNull().default("active"),
    invitedByUserId: text("invited_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    joinedAt: timestamp("joined_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("group_members_group_user_unique").on(
      table.groupId,
      table.userId,
    ),
    index("group_members_group_status_idx").on(table.groupId, table.status),
    index("group_members_user_status_idx").on(table.userId, table.status),
  ],
);
