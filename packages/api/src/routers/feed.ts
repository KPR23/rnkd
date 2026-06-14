import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import z from "zod";

import {
  db,
  feedCommentLikes,
  feedPostComments,
  feedPostLikes,
  feedPosts,
  friendships,
  user,
} from "@repo/db";

import { protectedProcedure, router } from "../trpc";

const postIdInput = z.object({ postId: z.string().uuid() });
const commentIdInput = z.object({ commentId: z.string().uuid() });

const MIN_POST_LENGTH = 1;
const MAX_POST_LENGTH = 2000;
const MIN_COMMENT_LENGTH = 1;
const MAX_COMMENT_LENGTH = 1000;

const createPostInput = z.object({
  body: z.string().trim().min(MIN_POST_LENGTH).max(MAX_POST_LENGTH),
});

const addCommentInput = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(MIN_COMMENT_LENGTH).max(MAX_COMMENT_LENGTH),
});

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

async function getVisibleAuthorIds(userId: string) {
  const friendIds = await getAcceptedFriendIds(userId);
  return [userId, ...friendIds];
}

async function requireVisiblePost(postId: string, userId: string) {
  const post = await db.query.feedPosts.findFirst({
    where: eq(feedPosts.id, postId),
  });

  if (!post) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
  }

  const visibleAuthorIds = await getVisibleAuthorIds(userId);

  if (!visibleAuthorIds.includes(post.authorUserId)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
  }

  return post;
}

type PostAuthor = {
  id: string;
  name: string;
  tag: string | null;
  image: string | null;
};

function mapAuthor(row: PostAuthor) {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    image: row.image,
  };
}

async function getPostCounts(postIds: string[], currentUserId: string) {
  if (postIds.length === 0) {
    return new Map<
      string,
      { likeCount: number; commentCount: number; likedByMe: boolean }
    >();
  }

  const [likeRows, commentRows, myLikes] = await Promise.all([
    db
      .select({
        postId: feedPostLikes.postId,
        count: sql<number>`count(*)::int`,
      })
      .from(feedPostLikes)
      .where(inArray(feedPostLikes.postId, postIds))
      .groupBy(feedPostLikes.postId),
    db
      .select({
        postId: feedPostComments.postId,
        count: sql<number>`count(*)::int`,
      })
      .from(feedPostComments)
      .where(inArray(feedPostComments.postId, postIds))
      .groupBy(feedPostComments.postId),
    db
      .select({ postId: feedPostLikes.postId })
      .from(feedPostLikes)
      .where(
        and(
          inArray(feedPostLikes.postId, postIds),
          eq(feedPostLikes.userId, currentUserId),
        ),
      ),
  ]);

  const likeCountByPost = new Map(
    likeRows.map((row) => [row.postId, row.count]),
  );
  const commentCountByPost = new Map(
    commentRows.map((row) => [row.postId, row.count]),
  );
  const likedByMe = new Set(myLikes.map((row) => row.postId));

  return new Map(
    postIds.map((postId) => [
      postId,
      {
        likeCount: likeCountByPost.get(postId) ?? 0,
        commentCount: commentCountByPost.get(postId) ?? 0,
        likedByMe: likedByMe.has(postId),
      },
    ]),
  );
}

async function getCommentCounts(commentIds: string[], currentUserId: string) {
  if (commentIds.length === 0) {
    return new Map<string, { likeCount: number; likedByMe: boolean }>();
  }

  const [likeRows, myLikes] = await Promise.all([
    db
      .select({
        commentId: feedCommentLikes.commentId,
        count: sql<number>`count(*)::int`,
      })
      .from(feedCommentLikes)
      .where(inArray(feedCommentLikes.commentId, commentIds))
      .groupBy(feedCommentLikes.commentId),
    db
      .select({ commentId: feedCommentLikes.commentId })
      .from(feedCommentLikes)
      .where(
        and(
          inArray(feedCommentLikes.commentId, commentIds),
          eq(feedCommentLikes.userId, currentUserId),
        ),
      ),
  ]);

  const likeCountByComment = new Map(
    likeRows.map((row) => [row.commentId, row.count]),
  );
  const likedByMe = new Set(myLikes.map((row) => row.commentId));

  return new Map(
    commentIds.map((commentId) => [
      commentId,
      {
        likeCount: likeCountByComment.get(commentId) ?? 0,
        likedByMe: likedByMe.has(commentId),
      },
    ]),
  );
}

export const feedRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const me = ctx.session.user.id;
    const visibleAuthorIds = await getVisibleAuthorIds(me);

    if (visibleAuthorIds.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        id: feedPosts.id,
        body: feedPosts.body,
        createdAt: feedPosts.createdAt,
        authorId: user.id,
        authorName: user.name,
        authorTag: user.tag,
        authorImage: user.image,
      })
      .from(feedPosts)
      .innerJoin(user, eq(feedPosts.authorUserId, user.id))
      .where(inArray(feedPosts.authorUserId, visibleAuthorIds))
      .orderBy(desc(feedPosts.createdAt), desc(feedPosts.id));

    const postIds = rows.map((row) => row.id);
    const counts = await getPostCounts(postIds, me);

    return rows.map((row) => {
      const postCounts = counts.get(row.id) ?? {
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
      };

      return {
        id: row.id,
        body: row.body,
        createdAt: row.createdAt,
        author: mapAuthor({
          id: row.authorId,
          name: row.authorName,
          tag: row.authorTag,
          image: row.authorImage,
        }),
        likeCount: postCounts.likeCount,
        commentCount: postCounts.commentCount,
        likedByMe: postCounts.likedByMe,
      };
    });
  }),

  createPost: protectedProcedure
    .input(createPostInput)
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;

      const [created] = await db
        .insert(feedPosts)
        .values({
          authorUserId: me,
          body: input.body,
        })
        .returning({
          id: feedPosts.id,
          body: feedPosts.body,
          createdAt: feedPosts.createdAt,
          authorUserId: feedPosts.authorUserId,
        });

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
        });
      }

      const author = await db.query.user.findFirst({
        columns: { id: true, name: true, tag: true, image: true },
        where: eq(user.id, me),
      });

      if (!author) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: created.id,
        body: created.body,
        createdAt: created.createdAt,
        author: mapAuthor(author),
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
      };
    }),

  togglePostLike: protectedProcedure
    .input(postIdInput)
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      await requireVisiblePost(input.postId, me);

      const existing = await db.query.feedPostLikes.findFirst({
        where: and(
          eq(feedPostLikes.postId, input.postId),
          eq(feedPostLikes.userId, me),
        ),
      });

      if (existing) {
        await db
          .delete(feedPostLikes)
          .where(eq(feedPostLikes.id, existing.id));

        return { liked: false as const };
      }

      await db.insert(feedPostLikes).values({
        postId: input.postId,
        userId: me,
      });

      return { liked: true as const };
    }),

  comments: protectedProcedure
    .input(postIdInput)
    .query(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      const post = await requireVisiblePost(input.postId, me);

      const [author, commentRows, postCounts] = await Promise.all([
        db.query.user.findFirst({
          columns: { id: true, name: true, tag: true, image: true },
          where: eq(user.id, post.authorUserId),
        }),
        db
          .select({
            id: feedPostComments.id,
            body: feedPostComments.body,
            createdAt: feedPostComments.createdAt,
            authorId: user.id,
            authorName: user.name,
            authorTag: user.tag,
            authorImage: user.image,
          })
          .from(feedPostComments)
          .innerJoin(user, eq(feedPostComments.authorUserId, user.id))
          .where(eq(feedPostComments.postId, input.postId))
          .orderBy(asc(feedPostComments.createdAt), asc(feedPostComments.id)),
        getPostCounts([input.postId], me),
      ]);

      if (!author) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const commentIds = commentRows.map((row) => row.id);
      const commentCounts = await getCommentCounts(commentIds, me);
      const counts = postCounts.get(input.postId) ?? {
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
      };

      return {
        post: {
          id: post.id,
          body: post.body,
          createdAt: post.createdAt,
          author: mapAuthor(author),
          likeCount: counts.likeCount,
          commentCount: counts.commentCount,
          likedByMe: counts.likedByMe,
        },
        comments: commentRows.map((row) => {
          const rowCounts = commentCounts.get(row.id) ?? {
            likeCount: 0,
            likedByMe: false,
          };

          return {
            id: row.id,
            body: row.body,
            createdAt: row.createdAt,
            author: mapAuthor({
              id: row.authorId,
              name: row.authorName,
              tag: row.authorTag,
              image: row.authorImage,
            }),
            likeCount: rowCounts.likeCount,
            likedByMe: rowCounts.likedByMe,
          };
        }),
      };
    }),

  addComment: protectedProcedure
    .input(addCommentInput)
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;
      await requireVisiblePost(input.postId, me);

      const [created] = await db
        .insert(feedPostComments)
        .values({
          postId: input.postId,
          authorUserId: me,
          body: input.body,
        })
        .returning({
          id: feedPostComments.id,
          body: feedPostComments.body,
          createdAt: feedPostComments.createdAt,
        });

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create comment",
        });
      }

      const author = await db.query.user.findFirst({
        columns: { id: true, name: true, tag: true, image: true },
        where: eq(user.id, me),
      });

      if (!author) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: created.id,
        body: created.body,
        createdAt: created.createdAt,
        author: mapAuthor(author),
        likeCount: 0,
        likedByMe: false,
      };
    }),

  toggleCommentLike: protectedProcedure
    .input(commentIdInput)
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session.user.id;

      const comment = await db.query.feedPostComments.findFirst({
        where: eq(feedPostComments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      await requireVisiblePost(comment.postId, me);

      const existing = await db.query.feedCommentLikes.findFirst({
        where: and(
          eq(feedCommentLikes.commentId, input.commentId),
          eq(feedCommentLikes.userId, me),
        ),
      });

      if (existing) {
        await db
          .delete(feedCommentLikes)
          .where(eq(feedCommentLikes.id, existing.id));

        return { liked: false as const };
      }

      await db.insert(feedCommentLikes).values({
        commentId: input.commentId,
        userId: me,
      });

      return { liked: true as const };
    }),
});
