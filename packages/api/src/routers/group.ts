import { randomInt } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import z from "zod";

import {
  db,
  friendships,
  groupMembers,
  groups as groupTable,
  user,
} from "@repo/db";

import { sendGroupInviteNotifications } from "../services/notifications/expo-push";
import { protectedProcedure, router } from "../trpc";

const groupIdInput = z.object({ groupId: z.string().uuid() });
const createGroupInput = z.object({
  name: z.string().trim().min(2).max(40),
  inviteUserIds: z.array(z.string()).default([]),
});
const inviteInput = z.object({
  groupId: z.string().uuid(),
  userIds: z.array(z.string()).min(1),
});

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 8;

function createInviteCode() {
  return Array.from({ length: INVITE_CODE_LENGTH }, () => {
    const index = randomInt(0, INVITE_CODE_ALPHABET.length);
    return INVITE_CODE_ALPHABET[index];
  }).join("");
}

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

async function isGroupNameTaken(name: string) {
  const existingGroup = await db.query.groups.findFirst({
    columns: { id: true },
    where: sql`lower(${groupTable.name}) = lower(${name})`,
  });

  return !!existingGroup;
}

async function getGroupByInviteCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  return await db.query.groups.findFirst({
    columns: { id: true, name: true },
    where: eq(groupTable.inviteCode, normalizedCode),
  });
}

async function getAcceptedFriendIds(userId: string) {
  const rows = await db
    .select({
      requesterUserId: friendships.requesterUserId,
      addresseeUserId: friendships.addresseeUserId,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterUserId, userId),
          eq(friendships.addresseeUserId, userId),
        ),
      ),
    )
    .orderBy(asc(friendships.createdAt), asc(friendships.id));

  return rows.map((row) =>
    row.requesterUserId === userId ? row.addresseeUserId : row.requesterUserId,
  );
}

async function requireActiveMembership(groupId: string, userId: string) {
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId),
      eq(groupMembers.status, "active"),
    ),
  });

  if (!membership) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
  }

  return membership;
}

async function requireOwner(groupId: string, userId: string) {
  const membership = await requireActiveMembership(groupId, userId);

  if (membership.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the group owner can manage players",
    });
  }

  return membership;
}

async function getGroupMembers(groupId: string) {
  const rows = await db
    .select({
      membershipId: groupMembers.id,
      userId: user.id,
      name: user.name,
      tag: user.tag,
      image: user.image,
      globalRs: user.globalRs,
      role: groupMembers.role,
      status: groupMembers.status,
      invitedByUserId: groupMembers.invitedByUserId,
      createdAt: groupMembers.createdAt,
    })
    .from(groupMembers)
    .innerJoin(user, eq(groupMembers.userId, user.id))
    .where(eq(groupMembers.groupId, groupId));

  return rows
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }

      if (a.status === "active") {
        const rsDiff = b.globalRs - a.globalRs;
        if (rsDiff !== 0) {
          return rsDiff;
        }

        const nameDiff = a.name.localeCompare(b.name);
        if (nameDiff !== 0) {
          return nameDiff;
        }

        return a.userId.localeCompare(b.userId);
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((row, index) => ({
      id: row.userId,
      membershipId: row.membershipId,
      rank: index + 1,
      name: row.name,
      tag: row.tag,
      image: row.image,
      rating: row.status === "active" ? row.globalRs : null,
      trend: null as number | null,
      pending: row.status === "invited",
      joinRequest: row.status === "invited" && row.invitedByUserId === null,
      role: row.role,
      status: row.status,
    }));
}

async function getGroupSummary(groupId: string, userId: string) {
  const group = await db.query.groups.findFirst({
    where: eq(groupTable.id, groupId),
  });

  if (!group) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
  }

  const members = await getGroupMembers(groupId);
  const activeMembers = members.filter((member) => member.status === "active");
  const currentUserPosition =
    activeMembers.findIndex((member) => member.id === userId) + 1 || null;

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    ownerUserId: group.ownerUserId,
    members: activeMembers.length,
    position: currentUserPosition,
  };
}

export const groupRouter = router({
  pendingInvites: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;

    const rows = await db
      .select({
        membershipId: groupMembers.id,
        groupId: groupTable.id,
        groupName: groupTable.name,
        invitedAt: groupMembers.createdAt,
        inviterId: user.id,
        inviterName: user.name,
        inviterTag: user.tag,
        inviterImage: user.image,
      })
      .from(groupMembers)
      .innerJoin(groupTable, eq(groupMembers.groupId, groupTable.id))
      .leftJoin(user, eq(groupMembers.invitedByUserId, user.id))
      .where(
        and(
          eq(groupMembers.userId, currentUserId),
          eq(groupMembers.status, "invited"),
        ),
      )
      .orderBy(desc(groupMembers.createdAt), desc(groupMembers.id));

    return await Promise.all(
      rows.map(async (row) => {
        const [memberCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.groupId, row.groupId),
              eq(groupMembers.status, "active"),
            ),
          );

        return {
          membershipId: row.membershipId,
          groupId: row.groupId,
          groupName: row.groupName,
          memberCount: memberCount?.count ?? 0,
          invitedAt: row.invitedAt,
          inviter: row.inviterId
            ? {
                id: row.inviterId,
                name: row.inviterName ?? "Someone",
                tag: row.inviterTag,
                image: row.inviterImage,
              }
            : null,
        };
      }),
    );
  }),

  acceptInvite: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, input.groupId),
          eq(groupMembers.userId, currentUserId),
          eq(groupMembers.status, "invited"),
        ),
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      await db
        .update(groupMembers)
        .set({ status: "active", joinedAt: new Date() })
        .where(eq(groupMembers.id, membership.id));

      return { groupId: input.groupId };
    }),

  declineInvite: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const deleted = await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, currentUserId),
            eq(groupMembers.status, "invited"),
          ),
        )
        .returning({ id: groupMembers.id });

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      return { ok: true as const };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;
    const currentUser = await db.query.user.findFirst({
      columns: { globalRs: true },
      where: eq(user.id, currentUserId),
    });

    const rows = await db
      .select({
        groupId: groupTable.id,
      })
      .from(groupMembers)
      .innerJoin(groupTable, eq(groupMembers.groupId, groupTable.id))
      .where(
        and(
          eq(groupMembers.userId, currentUserId),
          eq(groupMembers.status, "active"),
        ),
      )
      .orderBy(asc(groupTable.name), asc(groupTable.id));

    return {
      currentUserGlobalRs: currentUser?.globalRs ?? 0,
      groups: await Promise.all(
        rows.map((row) => getGroupSummary(row.groupId, currentUserId)),
      ),
    };
  }),

  ownedGroupsForInvite: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const ownedGroups = await db
        .select({
          id: groupTable.id,
          name: groupTable.name,
        })
        .from(groupMembers)
        .innerJoin(groupTable, eq(groupMembers.groupId, groupTable.id))
        .where(
          and(
            eq(groupMembers.userId, currentUserId),
            eq(groupMembers.status, "active"),
            eq(groupMembers.role, "owner"),
          ),
        )
        .orderBy(asc(groupTable.name), asc(groupTable.id));

      if (ownedGroups.length === 0) {
        return [];
      }

      const groupIds = ownedGroups.map((group) => group.id);

      const [memberCounts, targetMemberships] = await Promise.all([
        db
          .select({
            groupId: groupMembers.groupId,
            count: sql<number>`count(*)::int`,
          })
          .from(groupMembers)
          .where(
            and(
              inArray(groupMembers.groupId, groupIds),
              eq(groupMembers.status, "active"),
            ),
          )
          .groupBy(groupMembers.groupId),
        db
          .select({
            groupId: groupMembers.groupId,
            status: groupMembers.status,
            invitedByUserId: groupMembers.invitedByUserId,
          })
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.userId, input.userId),
              inArray(groupMembers.groupId, groupIds),
            ),
          ),
      ]);

      const countByGroup = new Map(
        memberCounts.map((row) => [row.groupId, row.count]),
      );
      const targetByGroup = new Map(
        targetMemberships.map((row) => [row.groupId, row]),
      );

      return ownedGroups.map((group) => {
        const target = targetByGroup.get(group.id);
        let playerStatus: "available" | "member" | "invited" | "join_request" =
          "available";

        if (target?.status === "active") {
          playerStatus = "member";
        } else if (target?.status === "invited") {
          playerStatus = target.invitedByUserId ? "invited" : "join_request";
        }

        return {
          id: group.id,
          name: group.name,
          members: countByGroup.get(group.id) ?? 0,
          playerStatus,
        };
      });
    }),

  detail: protectedProcedure
    .input(groupIdInput)
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const membership = await requireActiveMembership(
        input.groupId,
        currentUserId,
      );
      const group = await getGroupSummary(input.groupId, currentUserId);
      const members = await getGroupMembers(input.groupId);
      const currentUserRating =
        members.find((member) => member.id === currentUserId)?.rating ?? 0;

      return {
        group,
        currentUserRating,
        currentUserPosition: group.position,
        canManage: membership.role === "owner",
        members,
      };
    }),

  isNameAvailable: protectedProcedure
    .input(z.object({ name: z.string().trim().min(2).max(40) }))
    .query(async ({ input }) => {
      const taken = await isGroupNameTaken(input.name);
      return { available: !taken };
    }),

  validateInviteCode: protectedProcedure
    .input(z.object({ code: z.string().trim().min(1) }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const group = await getGroupByInviteCode(input.code);

      if (!group) {
        return { valid: false as const, reason: "not_found" as const };
      }

      const existingMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, group.id),
          eq(groupMembers.userId, currentUserId),
        ),
      });

      if (existingMembership?.status === "active") {
        return {
          valid: true as const,
          reason: "already_member" as const,
          groupId: group.id,
          groupName: group.name,
        };
      }

      if (
        existingMembership?.status === "invited" &&
        existingMembership.invitedByUserId
      ) {
        return {
          valid: false as const,
          reason: "pending_invitation" as const,
        };
      }

      return {
        valid: true as const,
        reason: "can_join" as const,
        groupId: group.id,
        groupName: group.name,
      };
    }),

  create: protectedProcedure
    .input(createGroupInput)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      if (await isGroupNameTaken(input.name)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Group name already exists",
        });
      }

      const friendIds = new Set(await getAcceptedFriendIds(currentUserId));
      const inviteUserIds = uniqueValues(input.inviteUserIds).filter(
        (userId) => userId !== currentUserId && friendIds.has(userId),
      );
      const inviter = await db.query.user.findFirst({
        columns: { name: true, tag: true },
        where: eq(user.id, currentUserId),
      });

      const result = await db.transaction(async (tx) => {
        const [createdGroup] = await tx
          .insert(groupTable)
          .values({
            name: input.name,
            inviteCode: createInviteCode(),
            ownerUserId: currentUserId,
          })
          .returning({
            id: groupTable.id,
            name: groupTable.name,
            inviteCode: groupTable.inviteCode,
          });

        if (!createdGroup) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group",
          });
        }

        await tx.insert(groupMembers).values({
          groupId: createdGroup.id,
          userId: currentUserId,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        });

        let invitedUserIds: string[] = [];

        if (inviteUserIds.length > 0) {
          const invitedRows = await tx
            .insert(groupMembers)
            .values(
              inviteUserIds.map((userId) => ({
                groupId: createdGroup.id,
                userId,
                role: "member" as const,
                status: "invited" as const,
                invitedByUserId: currentUserId,
              })),
            )
            .onConflictDoNothing({
              target: [groupMembers.groupId, groupMembers.userId],
            })
            .returning({ userId: groupMembers.userId });
          invitedUserIds = invitedRows.map((row) => row.userId);
        }

        return {
          groupId: createdGroup.id,
          groupName: createdGroup.name,
          inviteCode: createdGroup.inviteCode,
          invitedCount: invitedUserIds.length,
          invitedUserIds,
        };
      });

      await sendGroupInviteNotifications({
        recipientUserIds: result.invitedUserIds,
        inviterUserId: currentUserId,
        inviterName: inviter?.tag ?? inviter?.name ?? "Someone",
        groupId: result.groupId,
        groupName: result.groupName,
      });

      return {
        groupId: result.groupId,
        groupName: result.groupName,
        inviteCode: result.inviteCode,
        invitedCount: result.invitedCount,
      };
    }),

  joinByCode: protectedProcedure
    .input(z.object({ code: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const group = await getGroupByInviteCode(input.code);

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid group code",
        });
      }

      const existingMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, group.id),
          eq(groupMembers.userId, currentUserId),
        ),
      });

      if (existingMembership?.status === "active") {
        return { groupId: group.id, pending: false as const };
      }

      if (existingMembership?.status === "invited") {
        if (existingMembership.invitedByUserId) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "You already have a pending invitation to this group. Accept it from the Groups tab.",
          });
        }

        return { groupId: group.id, pending: true as const };
      }

      await db.insert(groupMembers).values({
        groupId: group.id,
        userId: currentUserId,
        role: "member",
        status: "invited",
      });

      return { groupId: group.id, pending: true as const };
    }),

  inviteCandidates: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      if (input.groupId) {
        await requireActiveMembership(input.groupId, currentUserId);
      }

      const friendIds = await getAcceptedFriendIds(currentUserId);

      if (friendIds.length === 0) {
        return [];
      }

      const users = await db
        .select({
          id: user.id,
          username: user.name,
          displayName: user.tag,
          image: user.image,
        })
        .from(user)
        .where(inArray(user.id, friendIds))
        .orderBy(asc(user.name), asc(user.id));

      const existingMemberIds = input.groupId
        ? new Set(
            (
              await db
                .select({ userId: groupMembers.userId })
                .from(groupMembers)
                .where(eq(groupMembers.groupId, input.groupId))
            ).map((row) => row.userId),
          )
        : new Set<string>();

      const normalizedSearch = input.search?.trim().toLowerCase();

      return users
        .filter((friend) => !existingMemberIds.has(friend.id))
        .filter((friend) => {
          if (!normalizedSearch) return true;

          return (
            friend.username.toLowerCase().includes(normalizedSearch) ||
            (friend.displayName ?? "").toLowerCase().includes(normalizedSearch)
          );
        })
        .map((friend) => ({
          ...friend,
          displayName: friend.displayName ?? "Friend",
        }));
    }),

  invite: protectedProcedure
    .input(inviteInput)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      await requireActiveMembership(input.groupId, currentUserId);

      const friendIds = new Set(await getAcceptedFriendIds(currentUserId));
      const inviteUserIds = uniqueValues(input.userIds).filter(
        (userId) => userId !== currentUserId && friendIds.has(userId),
      );

      if (inviteUserIds.length === 0) {
        return { invitedCount: 0 };
      }

      const group = await db.query.groups.findFirst({
        columns: { name: true },
        where: eq(groupTable.id, input.groupId),
      });
      const inviter = await db.query.user.findFirst({
        columns: { name: true, tag: true },
        where: eq(user.id, currentUserId),
      });

      const invitedRows = await db
        .insert(groupMembers)
        .values(
          inviteUserIds.map((userId) => ({
            groupId: input.groupId,
            userId,
            role: "member" as const,
            status: "invited" as const,
            invitedByUserId: currentUserId,
          })),
        )
        .onConflictDoNothing({
          target: [groupMembers.groupId, groupMembers.userId],
        })
        .returning({ userId: groupMembers.userId });

      await sendGroupInviteNotifications({
        recipientUserIds: invitedRows.map((row) => row.userId),
        inviterUserId: currentUserId,
        inviterName: inviter?.tag ?? inviter?.name ?? "Someone",
        groupId: input.groupId,
        groupName: group?.name ?? "a group",
      });

      return { invitedCount: invitedRows.length };
    }),

  approveMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      await requireOwner(input.groupId, currentUserId);

      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, input.groupId),
          eq(groupMembers.userId, input.userId),
          eq(groupMembers.status, "invited"),
        ),
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pending member not found",
        });
      }

      await db
        .update(groupMembers)
        .set({ status: "active", joinedAt: new Date() })
        .where(eq(groupMembers.id, membership.id));

      return { ok: true as const };
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      await requireOwner(input.groupId, currentUserId);

      if (input.userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Owner cannot be removed",
        });
      }

      const deleted = await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, input.userId),
          ),
        )
        .returning({ id: groupMembers.id });

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return { ok: true as const };
    }),

  deleteGroup: protectedProcedure
    .input(groupIdInput)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      await requireOwner(input.groupId, currentUserId);

      const deleted = await db
        .delete(groupTable)
        .where(eq(groupTable.id, input.groupId))
        .returning({ id: groupTable.id });

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return { ok: true as const };
    }),

  leave: protectedProcedure
    .input(groupIdInput)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const membership = await requireActiveMembership(
        input.groupId,
        currentUserId,
      );

      if (membership.role === "owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Group owner cannot leave the group",
        });
      }

      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, currentUserId),
          ),
        );

      return { ok: true as const };
    }),
});
