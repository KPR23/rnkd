import type { FeedPostCardData } from "@/src/components/feed/FeedPostCard";
import type { FeedFriendRequestCardData } from "@/src/components/feed/FeedFriendRequestCard";

export type FeedPostTimelineItem = {
  kind: "post";
  post: FeedPostCardData;
};

export type FeedFriendRequestTimelineItem = {
  kind: "friendRequest";
  request: FeedFriendRequestCardData;
};

export type FeedTimelineItem =
  | FeedPostTimelineItem
  | FeedFriendRequestTimelineItem;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function getFeedTimelineItemId(item: FeedTimelineItem): string {
  return item.kind === "post" ? item.post.id : item.request.id;
}

export function getFeedTimelineItemDate(item: FeedTimelineItem): Date {
  return item.kind === "post"
    ? toDate(item.post.createdAt)
    : toDate(item.request.createdAt);
}

export function getFeedTimelineItemKey(item: FeedTimelineItem): string {
  return `${item.kind}:${getFeedTimelineItemId(item)}`;
}

export function mergeFeedTimelineItems(
  posts: FeedPostCardData[],
  friendRequests: FeedFriendRequestCardData[],
): FeedTimelineItem[] {
  const items: FeedTimelineItem[] = [
    ...posts.map((post) => ({ kind: "post" as const, post })),
    ...friendRequests.map((request) => ({
      kind: "friendRequest" as const,
      request,
    })),
  ];

  return items.sort(
    (a, b) =>
      getFeedTimelineItemDate(b).getTime() -
      getFeedTimelineItemDate(a).getTime(),
  );
}
