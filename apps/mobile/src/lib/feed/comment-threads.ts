import type { FeedCommentData } from "@/src/components/feed/FeedCommentRow";

export function groupCommentsByParent(comments: FeedCommentData[]) {
  const repliesByParent = new Map<string, FeedCommentData[]>();
  const topLevel: FeedCommentData[] = [];

  for (const comment of comments) {
    if (comment.parentCommentId) {
      const existing = repliesByParent.get(comment.parentCommentId) ?? [];
      existing.push(comment);
      repliesByParent.set(comment.parentCommentId, existing);
    } else {
      topLevel.push(comment);
    }
  }

  return { topLevel, repliesByParent };
}
