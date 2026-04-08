import { db, friendships, user } from "@repo/db";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, or } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, router } from "../trpc";

const userIdInput = z.object({ userId: z.string() });

async function requireUser(id: string) {
	const row = await db.query.user.findFirst({
		where: eq(user.id, id),
	});

	if (!row) {
		throw new TRPCError({ code: "NOT_FOUND" });
	}

	return row;
}

export const friendRouter = router({
	relationship: protectedProcedure
		.input(userIdInput)
		.query(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			if (me === input.userId) {
				return {
					status: "default" as const,
					pendingDirection: undefined as undefined,
				};
			}

			const row = await db.query.friendships.findFirst({
				where: or(
					and(
						eq(friendships.requesterUserId, me),
						eq(friendships.addresseeUserId, input.userId),
					),
					and(
						eq(friendships.requesterUserId, input.userId),
						eq(friendships.addresseeUserId, me),
					),
				),
			});

			if (!row) {
				return {
					status: "default" as const,
					pendingDirection: undefined as undefined,
				};
			}

			if (row.status === "accepted") {
				return {
					status: "friends" as const,
					pendingDirection: undefined as undefined,
				};
			}

			return {
				status: "pending" as const,
				pendingDirection:
					row.requesterUserId === me
						? ("outgoing" as const)
						: ("incoming" as const),
			};
		}),

	request: protectedProcedure
		.input(userIdInput)
		.mutation(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			if (me === input.userId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot add yourself",
				});
			}

			await requireUser(input.userId);

			return await db.transaction(async (tx) => {
				const inversePending = await tx.query.friendships.findFirst({
					where: and(
						eq(friendships.requesterUserId, input.userId),
						eq(friendships.addresseeUserId, me),
						eq(friendships.status, "pending"),
					),
				});

				if (inversePending) {
					await tx
						.update(friendships)
						.set({ status: "accepted" })
						.where(eq(friendships.id, inversePending.id));

					return { outcome: "friends" as const };
				}

				const anyBetween = await tx.query.friendships.findFirst({
					where: or(
						and(
							eq(friendships.requesterUserId, me),
							eq(friendships.addresseeUserId, input.userId),
						),
						and(
							eq(friendships.requesterUserId, input.userId),
							eq(friendships.addresseeUserId, me),
						),
					),
				});

				if (anyBetween?.status === "accepted") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Already friends",
					});
				}

				if (anyBetween?.status === "pending") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Friend request already pending",
					});
				}

				await tx.insert(friendships).values({
					requesterUserId: me,
					addresseeUserId: input.userId,
					status: "pending",
				});

				return { outcome: "pending" as const };
			});
		}),

	accept: protectedProcedure
		.input(z.object({ requesterId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			const updated = await db
				.update(friendships)
				.set({ status: "accepted" })
				.where(
					and(
						eq(friendships.requesterUserId, input.requesterId),
						eq(friendships.addresseeUserId, me),
						eq(friendships.status, "pending"),
					),
				)
				.returning({ id: friendships.id });

			if (updated.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No pending request from this user",
				});
			}

			return { ok: true as const };
		}),

	decline: protectedProcedure
		.input(z.object({ requesterId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			const deleted = await db
				.delete(friendships)
				.where(
					and(
						eq(friendships.requesterUserId, input.requesterId),
						eq(friendships.addresseeUserId, me),
						eq(friendships.status, "pending"),
					),
				)
				.returning({ id: friendships.id });

			if (deleted.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No pending request from this user",
				});
			}

			return { ok: true as const };
		}),

	cancelRequest: protectedProcedure
		.input(userIdInput)
		.mutation(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			const deleted = await db
				.delete(friendships)
				.where(
					and(
						eq(friendships.requesterUserId, me),
						eq(friendships.addresseeUserId, input.userId),
						eq(friendships.status, "pending"),
					),
				)
				.returning({ id: friendships.id });

			if (deleted.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No outgoing request to cancel",
				});
			}

			return { ok: true as const };
		}),

	remove: protectedProcedure
		.input(userIdInput)
		.mutation(async ({ ctx, input }) => {
			const me = ctx.session.user.id;

			if (me === input.userId) {
				throw new TRPCError({ code: "BAD_REQUEST" });
			}

			const deleted = await db
				.delete(friendships)
				.where(
					and(
						eq(friendships.status, "accepted"),
						or(
							and(
								eq(friendships.requesterUserId, me),
								eq(friendships.addresseeUserId, input.userId),
							),
							and(
								eq(friendships.requesterUserId, input.userId),
								eq(friendships.addresseeUserId, me),
							),
						),
					),
				)
				.returning({ id: friendships.id });

			if (deleted.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Not friends with this user",
				});
			}

			return { ok: true as const };
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		const me = ctx.session.user.id;

		const rows = await db
			.select()
			.from(friendships)
			.where(
				and(
					eq(friendships.status, "accepted"),
					or(
						eq(friendships.requesterUserId, me),
						eq(friendships.addresseeUserId, me),
					),
				),
			);

		const otherIds = rows.map((r) =>
			r.requesterUserId === me ? r.addresseeUserId : r.requesterUserId,
		);

		if (otherIds.length === 0) {
			return [];
		}

		const users = await db
			.select({
				id: user.id,
				name: user.name,
				tag: user.tag,
				image: user.image,
			})
			.from(user)
			.where(inArray(user.id, otherIds));

		const byId = new Map(users.map((u) => [u.id, u]));

		return otherIds
			.map((id) => byId.get(id))
			.filter(Boolean)
			.map((u) => ({
				id: u!.id,
				name: u!.name,
				tag: u!.tag,
				image: u!.image,
			}));
	}),
});
