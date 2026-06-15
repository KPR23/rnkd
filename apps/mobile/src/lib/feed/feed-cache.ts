import type { FeedCommentData } from "@/src/components/feed/FeedCommentRow";
import type { FeedPostAuthor } from "@/src/components/feed/FeedPostCard";
import { trpc } from "@/src/utils/trpc";

export type FeedCommentsCache = {
  post: FeedListPost;
  comments: FeedListComment[];
};

export type FeedCacheUtils = ReturnType<typeof trpc.useUtils>;

type FeedListPost = NonNullable<
  ReturnType<FeedCacheUtils["feed"]["list"]["getData"]>
>[number];

type FeedListComment = NonNullable<
  ReturnType<FeedCacheUtils["feed"]["comments"]["getData"]>
>["comments"][number];

function normalizeAuthor(author: FeedPostAuthor) {
  return {
    id: author.id,
    name: author.name,
    tag: author.tag ?? null,
    image: author.image ?? null,
  };
}

function toFeedListPost(post: {
  id: string;
  body: string;
  createdAt: Date;
  author: FeedPostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isPending?: boolean;
}): FeedListPost {
  return {
    id: post.id,
    body: post.body,
    createdAt: post.createdAt,
    author: normalizeAuthor(post.author),
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    likedByMe: post.likedByMe,
  };
}

function toFeedListComment(comment: FeedCommentData): FeedListComment {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    author: normalizeAuthor(comment.author),
    likeCount: comment.likeCount,
    likedByMe: comment.likedByMe,
  };
}

function updatePostFields(
  post: FeedListPost,
  patch: Partial<FeedListPost>,
): FeedListPost {
  return { ...post, ...patch };
}

function toggleLike(post: FeedListPost): FeedListPost {
  const likedByMe = !post.likedByMe;
  return updatePostFields(post, {
    likedByMe,
    likeCount: likedByMe
      ? post.likeCount + 1
      : Math.max(0, post.likeCount - 1),
  });
}

function toggleCommentLike(comment: FeedListComment): FeedListComment {
  const likedByMe = !comment.likedByMe;
  return {
    ...comment,
    likedByMe,
    likeCount: likedByMe
      ? comment.likeCount + 1
      : Math.max(0, comment.likeCount - 1),
  };
}

export function updatePostInFeedList(
  utils: FeedCacheUtils,
  postId: string,
  updater: (post: FeedListPost) => FeedListPost,
) {
  utils.feed.list.setData(undefined, (current) => {
    if (!current) return current;
    return current.map((post) =>
      post.id === postId ? updater(post) : post,
    );
  });
}

export function updatePostInCommentsCache(
  utils: FeedCacheUtils,
  postId: string,
  updater: (post: FeedListPost) => FeedListPost,
) {
  const existing = utils.feed.comments.getData({ postId });
  if (!existing) return;

  utils.feed.comments.setData({ postId }, {
    ...existing,
    post: updater(existing.post),
  });
}

export function togglePostLikeInCaches(utils: FeedCacheUtils, postId: string) {
  updatePostInFeedList(utils, postId, toggleLike);
  updatePostInCommentsCache(utils, postId, toggleLike);
}

export function incrementPostCommentCountInCaches(
  utils: FeedCacheUtils,
  postId: string,
) {
  const increment = (post: FeedListPost) =>
    updatePostFields(post, { commentCount: post.commentCount + 1 });

  updatePostInFeedList(utils, postId, increment);
  updatePostInCommentsCache(utils, postId, increment);
}

export function decrementPostCommentCountInCaches(
  utils: FeedCacheUtils,
  postId: string,
) {
  const decrement = (post: FeedListPost) =>
    updatePostFields(post, {
      commentCount: Math.max(0, post.commentCount - 1),
    });

  updatePostInFeedList(utils, postId, decrement);
  updatePostInCommentsCache(utils, postId, decrement);
}

export function removePostFromFeedList(utils: FeedCacheUtils, postId: string) {
  utils.feed.list.setData(undefined, (current) =>
    current?.filter((post) => post.id !== postId) ?? [],
  );
}

export function prependPostToFeedList(
  utils: FeedCacheUtils,
  post: Parameters<typeof toFeedListPost>[0],
) {
  utils.feed.list.setData(undefined, (current) => [
    toFeedListPost(post),
    ...(current ?? []),
  ]);
}

export function replacePostInFeedList(
  utils: FeedCacheUtils,
  tempId: string,
  post: Parameters<typeof toFeedListPost>[0],
) {
  const normalized = toFeedListPost(post);
  utils.feed.list.setData(undefined, (current) =>
    current?.map((item) => (item.id === tempId ? normalized : item)) ?? [],
  );
}

export function removePostFromFeedListById(
  utils: FeedCacheUtils,
  postId: string,
) {
  utils.feed.list.setData(undefined, (current) =>
    current?.filter((post) => post.id !== postId) ?? [],
  );
}

export function updateCommentInCache(
  utils: FeedCacheUtils,
  postId: string,
  commentId: string,
  updater: (comment: FeedListComment) => FeedListComment,
) {
  const existing = utils.feed.comments.getData({ postId });
  if (!existing) return;

  utils.feed.comments.setData({ postId }, {
    ...existing,
    comments: existing.comments.map((comment) =>
      comment.id === commentId ? updater(comment) : comment,
    ),
  });
}

export function toggleCommentLikeInCache(
  utils: FeedCacheUtils,
  postId: string,
  commentId: string,
) {
  updateCommentInCache(utils, postId, commentId, toggleCommentLike);
}

export function appendCommentToCache(
  utils: FeedCacheUtils,
  postId: string,
  comment: FeedCommentData,
) {
  const existing = utils.feed.comments.getData({ postId });
  if (!existing) return;

  utils.feed.comments.setData({ postId }, {
    ...existing,
    comments: [...existing.comments, toFeedListComment(comment)],
  });
}

export function replaceCommentInCache(
  utils: FeedCacheUtils,
  postId: string,
  tempId: string,
  comment: FeedCommentData,
) {
  const existing = utils.feed.comments.getData({ postId });
  if (!existing) return;

  const normalized = toFeedListComment(comment);
  utils.feed.comments.setData({ postId }, {
    ...existing,
    comments: existing.comments.map((item) =>
      item.id === tempId ? normalized : item,
    ),
  });
}

export function removeCommentFromCache(
  utils: FeedCacheUtils,
  postId: string,
  commentId: string,
) {
  const existing = utils.feed.comments.getData({ postId });
  if (!existing) return;

  utils.feed.comments.setData({ postId }, {
    ...existing,
    comments: existing.comments.filter((comment) => comment.id !== commentId),
  });
  decrementPostCommentCountInCaches(utils, postId);
}

export function createLocalId(prefix: "post" | "comment") {
  return `local-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function cancelFeedCaches(
  utils: FeedCacheUtils,
  postId?: string,
) {
  const tasks = [utils.feed.list.cancel()];
  if (postId) {
    tasks.push(utils.feed.comments.cancel({ postId }));
  }
  await Promise.all(tasks);
}

export function snapshotFeedCaches(utils: FeedCacheUtils, postId?: string) {
  return {
    list: utils.feed.list.getData(),
    comments: postId ? utils.feed.comments.getData({ postId }) : undefined,
  };
}

export function restoreFeedCaches(
  utils: FeedCacheUtils,
  snapshot: {
    list: ReturnType<FeedCacheUtils["feed"]["list"]["getData"]>;
    comments?: ReturnType<FeedCacheUtils["feed"]["comments"]["getData"]>;
  },
  postId?: string,
) {
  if (snapshot.list) {
    utils.feed.list.setData(undefined, snapshot.list);
  }
  if (postId && snapshot.comments) {
    utils.feed.comments.setData({ postId }, snapshot.comments);
  }
}
