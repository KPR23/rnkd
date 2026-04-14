export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/[%_]/g, "");
}
