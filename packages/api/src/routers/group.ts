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
        return b.globalRs - a.globalRs;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    })
    .map((row, index) => ({
      id: row.userId,
      membershipId: row.membershipId,
      rank: index + 1,
      name: row.name,
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

      return await db.transaction(async (tx) => {
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

        if (inviteUserIds.length > 0) {
          await tx
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
            });
        }

        return {
          groupId: createdGroup.id,
          groupName: createdGroup.name,
          inviteCode: createdGroup.inviteCode,
          invitedCount: inviteUserIds.length,
        };
      });
    }),

  joinByCode: protectedProcedure
    .input(z.object({ code: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const normalizedCode = input.code.trim().toUpperCase();
      const group = await db.query.groups.findFirst({
        where: eq(groupTable.inviteCode, normalizedCode),
      });

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

      await db
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
        });

      return { invitedCount: inviteUserIds.length };
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
