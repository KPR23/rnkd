import { db, games } from "@repo/db";
import { type SearchGameResult } from "@repo/types";
import { ilike, or } from "drizzle-orm";
import { normalizeSearchQuery } from "./query";

const SEARCH_GAMES_LIMIT = 8;

export async function searchGames(query: string): Promise<SearchGameResult[]> {
	const safeQuery = normalizeSearchQuery(query);

	if (!safeQuery) {
		return [];
	}

	const results = await db.query.games.findMany({
		where: or(
			ilike(games.name, `${safeQuery}%`),
			ilike(games.name, `%${safeQuery}%`),
		),
		limit: SEARCH_GAMES_LIMIT,
	});

	return results.map((game) => ({
		id: game.id as SearchGameResult["id"],
		name: game.name,
		type: "game",
	}));
}
