import { type SearchResult } from "@repo/types";

import { searchGames } from "./games";
import { searchUsers } from "./users";

export async function searchAll(query: string): Promise<SearchResult[]> {
  const [users, games] = await Promise.all([
    searchUsers(query),
    searchGames(query),
  ]);

  return [...users, ...games];
}
