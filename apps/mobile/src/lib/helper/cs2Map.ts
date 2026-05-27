const CS2_MAP_THUMB_BASE =
  "https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs";

function normalizeMapName(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase().replace(/-\d+$/, "");
  if (normalized.startsWith("de_")) {
    return normalized;
  }

  const slug = normalized.replace(/\s+/g, "_");
  return slug.startsWith("de_") ? slug : `de_${slug}`;
}

export function getCs2MapImageUrl(
  mapName: string | null | undefined,
): string | null {
  const normalized = normalizeMapName(mapName);
  if (!normalized) return null;

  return `${CS2_MAP_THUMB_BASE}/${normalized}_1_png.png`;
}
