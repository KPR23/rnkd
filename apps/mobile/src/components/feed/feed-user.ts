import type { User } from "@repo/types";

import type { FeedPostAuthor } from "./FeedPostCard";

export function toFeedUser(author: FeedPostAuthor): User {
  const now = new Date();

  return {
    id: author.id,
    name: author.name,
    image: author.image ?? null,
    email: "",
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    tag: author.tag ?? "",
    bio: null,
    favoriteGameId: null,
    region: null,
    globalRs: 0,
  };
}
