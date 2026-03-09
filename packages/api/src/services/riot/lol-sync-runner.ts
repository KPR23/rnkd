import { db, gameAccounts, GAMES } from "@repo/db";
import { and, eq, inArray } from "drizzle-orm";
import { getFollowedAccounts } from "../helper";
import { mapRiotMatchToDb } from "./lol-sync";
import { getMatchById, getMatchIdsByPuuid } from "./riot";
import { RiotRegion } from "./types";
import { assertRiotRegion } from "./helper";

const MAX_MATCHES_TO_SYNC = 100;
const RIOT_API_DELAY_MS = 150;

export async function syncLolForAccount(
	gameAccountId: string,
	maxMatchesToSync: number = MAX_MATCHES_TO_SYNC,
) {
	const [account] = await db
		.select()
		.from(gameAccounts)
		.where(
			and(
				eq(gameAccounts.id, gameAccountId),
				eq(gameAccounts.gameId, GAMES.LOL),
			),
		);

	if (!account || !account.userId || !account.region) {
		throw new Error("Account not found");
	}

	const followedAccounts = await getFollowedAccounts(account.userId);

	const followedAccountsIds = followedAccounts.map(
		(follow) => follow.gameAccountId,
	);

	const followedLolAccounts = await db
		.select()
		.from(gameAccounts)
		.where(
			and(
				inArray(gameAccounts.id, followedAccountsIds),
				eq(gameAccounts.gameId, GAMES.LOL),
			),
		);

	assertRiotRegion(account.region);

	const matchIds = await getMatchIdsByPuuid(
		account.externalId,
		account.region,
		maxMatchesToSync,
	);

	const riotMatches: Awaited<ReturnType<typeof getMatchById>>[] = [];
	for (const id of matchIds.slice(0, maxMatchesToSync)) {
		riotMatches.push(await getMatchById(id, account.region as RiotRegion));
		await new Promise((r) => setTimeout(r, RIOT_API_DELAY_MS));
	}

	const knownAccountsByPuuid: Record<string, string> = {
		[account.externalId]: gameAccountId,
		...followedLolAccounts.reduce(
			(acc, followedAccount) => {
				acc[followedAccount.externalId] = followedAccount.id;
				return acc;
			},
			{} as Record<string, string>,
		),
	};

	const savedMatches = await Promise.all(
		riotMatches.map((match) => mapRiotMatchToDb(match, knownAccountsByPuuid)),
	);

	return savedMatches.length;
}
