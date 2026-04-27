import { type SearchResult } from "@repo/types";

import { searchGames } from "./games";
import { searchUsers } from "./users";

export async function searchAll(query: string): Promise<SearchResult[]> {
  try {
    const [users, games] = await Promise.all([
      searchUsers(query),
      searchGames(query),
    ]);

    return [...users, ...games];
  } catch (error) {
    console.error("searchAll failed", { query, error });
    return [];
  }
}
