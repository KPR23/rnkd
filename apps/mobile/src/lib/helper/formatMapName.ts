export function formatMapDisplayName(
  mapName: string | null | undefined,
): string {
  const trimmed = mapName?.trim();
  if (!trimmed) return "Unknown map";

  const withoutPrefix = trimmed.replace(/^de_/i, "");
  return withoutPrefix
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
