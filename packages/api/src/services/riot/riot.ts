import { getRiotApiKey, getRiotApiUrl } from "./helper";
import { MatchResponse, QueueType, RiotRegion } from "./types";

export async function getAccountByRiotId(
	gameName: string,
	tagLine: string,
	region: RiotRegion,
) {
	try {
		const baseUrl = getRiotApiUrl(region);
		const response = await fetch(
			`${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
			{
				signal: AbortSignal.timeout(5000),
				headers: {
					"X-Riot-Token": getRiotApiKey(),
				},
			},
		);
		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			throw new Error(
				err.status?.message ?? `Riot API error: ${response.status}`,
			);
		}
		const data = (await response.json()) as { puuid: string };
		return data.puuid;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function getMatchIdsByPuuid(
	puuid: string,
	region: RiotRegion,
	count = 100,
	queue?: QueueType,
): Promise<string[]> {
	const baseUrl = getRiotApiUrl(region);
	const params = new URLSearchParams({ count: String(count) });
	if (queue !== undefined) params.set("queue", String(queue));

	const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${params}`;

	const response = await fetch(url, {
		signal: AbortSignal.timeout(10000),
		headers: {
			"X-Riot-Token": getRiotApiKey(),
		},
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as string[];
	return data;
}

export async function getMatchById(matchId: string, region: RiotRegion) {
	const baseUrl = getRiotApiUrl(region);
	const url = `${baseUrl}/lol/match/v5/matches/${matchId}`;
	const response = await fetch(url, {
		signal: AbortSignal.timeout(10000),
		headers: {
			"X-Riot-Token": getRiotApiKey(),
		},
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as MatchResponse;
	return data;
}
