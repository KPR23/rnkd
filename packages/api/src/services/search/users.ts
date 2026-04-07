import { db, gameAccounts, user } from "@repo/db";
import { GAMES, type GameId, type SearchPlayerResult } from "@repo/types";
import { ilike, inArray, or } from "drizzle-orm";
import { normalizeSearchQuery } from "./query";

function displayLabelForGameAccount(account: {
	gameId: string;
	externalId: string;
	lolProfile: {
		gameName: string;
		tagLine: string;
	} | null;
	cs2FaceitProfile: {
		faceitNickname: string | null;
		steamNickname: string | null;
	} | null;
}): string | null {
	switch (account.gameId) {
		case GAMES.LOL: {
			const { gameName } = account.lolProfile ?? {};
			if (gameName) {
				return gameName;
			}

			return account.externalId;
		}
		case GAMES.CS2_FACEIT: {
			const { faceitNickname, steamNickname } = account.cs2FaceitProfile ?? {};
			if (faceitNickname || steamNickname) {
				return faceitNickname ?? steamNickname ?? account.externalId;
			}

			return account.externalId;
		}
		default:
			return account.externalId ?? null;
	}
}

export async function searchUsers(query: string): Promise<SearchPlayerResult[]> {
	const safeQuery = normalizeSearchQuery(query);

	if (!safeQuery) {
		return [];
	}

	const results = await db.query.user.findMany({
		where: or(
			ilike(user.name, `${safeQuery}%`),
			ilike(user.name, `% ${safeQuery}%`),
			ilike(user.tag, `${safeQuery}%`),
		),
		limit: 20,
	});

	if (results.length === 0) {
		return [];
	}

	const userIds = results.map((row) => row.id);

	const gameAccountsResults = await db.query.gameAccounts.findMany({
		where: inArray(gameAccounts.userId, userIds),
		with: {
			lolProfile: true,
			cs2FaceitProfile: true,
		},
		limit: 2,
	});

	const gameAccountsByUserId = new Map<
		string,
		(typeof gameAccountsResults)[number][]
	>();

	for (const account of gameAccountsResults) {
		const userId = account.userId;

		if (!userId) {
			continue;
		}

		const list = gameAccountsByUserId.get(userId) ?? [];
		list.push(account);
		gameAccountsByUserId.set(userId, list);
	}

	return results.map((row) => {
		const accounts = gameAccountsByUserId.get(row.id) ?? [];

		const games = accounts
			.map((account) => {
				const displayLabel = displayLabelForGameAccount(account);

				if (!displayLabel) {
					return null;
				}

				return {
					gameId: account.gameId as GameId,
					displayLabel,
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null);

		return {
			id: row.id,
			type: "player",
			name: row.name,
			tag: row.tag,
			image: row.image,
			games,
		};
	});
}
