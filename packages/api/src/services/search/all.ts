import { type SearchResult } from "@repo/types";

import { searchGames } from "./games";
import { searchUsers } from "./users";

/**
 * Runs all search providers. Database/provider errors are allowed to throw so
 * API boundaries can surface failures instead of returning incomplete results.
 */
export async function searchAll(query: string): Promise<SearchResult[]> {
  const [users, games] = await Promise.all([
    searchUsers(query),
    searchGames(query),
  ]);

  return [...users, ...games];
}
