export function normalizeUserTag(tag: string): string {
  return tag.trim().replace(/^@+/, "");
}

export function formatUserDisplayName(user: {
  name: string;
  tag?: string | null;
}): string {
  const trimmedTag = user.tag?.trim();
  if (!trimmedTag) {
    return user.name;
  }

  return normalizeUserTag(trimmedTag);
}
