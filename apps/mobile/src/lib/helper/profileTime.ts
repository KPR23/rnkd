export function formatRelativeLastActive(lastActiveAt: Date | null | undefined): string {
  if (!lastActiveAt || Number.isNaN(lastActiveAt.getTime())) {
    return "—";
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (lastActiveAt >= startOfToday) {
    return "Today";
  }

  if (lastActiveAt >= startOfYesterday) {
    return "Yesterday";
  }

  const diffDays = Math.floor(
    (startOfToday.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return lastActiveAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatProfileMatchTime(playedAt: Date): string {
  if (Number.isNaN(playedAt.getTime())) {
    return "—";
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const time = playedAt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (playedAt >= startOfToday) {
    return `Today, ${time}`;
  }

  if (playedAt >= startOfYesterday) {
    return `Yesterday, ${time}`;
  }

  const date = playedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return `${date}, ${time}`;
}
