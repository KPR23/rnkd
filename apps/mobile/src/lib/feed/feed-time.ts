export function formatFeedRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 60_000) {
    return "Now";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export type FeedDateSectionLabel = {
  primary: string;
  secondary?: string;
};

export function getFeedDateSectionLabel(date: Date): FeedDateSectionLabel {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  if (date >= startOfToday) {
    return { primary: "Today", secondary: formattedDate };
  }

  if (date >= startOfYesterday) {
    return { primary: "Yesterday", secondary: formattedDate };
  }

  return { primary: formattedDate };
}

export function isOlderThanYesterday(date: Date): boolean {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  return date < startOfYesterday;
}

export type FeedPostItem = {
  id: string;
  createdAt: Date;
};

export type FeedDateGroup<T extends FeedPostItem> = {
  label: FeedDateSectionLabel;
  posts: T[];
  showOlderDividerBefore?: boolean;
};

export function groupFeedPostsByDate<T extends FeedPostItem>(
  posts: T[],
): FeedDateGroup<T>[] {
  const groups: FeedDateGroup<T>[] = [];
  let hasSeenOlderThanYesterday = false;

  for (const post of posts) {
    const createdAt =
      post.createdAt instanceof Date
        ? post.createdAt
        : new Date(post.createdAt);
    const label = getFeedDateSectionLabel(createdAt);
    const labelKey = `${label.primary}|${label.secondary ?? ""}`;
    const isOlder = isOlderThanYesterday(createdAt);
    const showOlderDividerBefore = isOlder && !hasSeenOlderThanYesterday;

    if (isOlder) {
      hasSeenOlderThanYesterday = true;
    }

    const lastGroup = groups[groups.length - 1];
    const lastKey = lastGroup
      ? `${lastGroup.label.primary}|${lastGroup.label.secondary ?? ""}`
      : null;

    if (lastGroup && lastKey === labelKey) {
      lastGroup.posts.push(post);
    } else {
      groups.push({
        label,
        posts: [post],
        showOlderDividerBefore,
      });
    }
  }

  return groups;
}
