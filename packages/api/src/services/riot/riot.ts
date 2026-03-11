import { env } from "@repo/env";
import { fetchWithRetry, getPlatformApiUrl, getRiotApiUrl } from "./helper";
import {
	MatchResponse,
	QueueType,
	RiotPlatformRoute,
	RiotRegionalRoute,
} from "./types";

const RIOT_API_KEY = env.RIOT_API_KEY;

export async function getAccountByRiotId(
	gameName: string,
	tagLine: string,
	region: RiotRegionalRoute,
) {
	const baseUrl = getRiotApiUrl(region);
	const response: Response = await fetchWithRetry(
		`${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
		{
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
			},
		},
		5000,
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as {
		puuid: string;
		gameName: string;
		tagLine: string;
	};
	return {
		puuid: data.puuid,
		gameName: data.gameName,
		tagLine: data.tagLine,
	};
}

export async function getLolActiveRegionByPuuid(
	puuid: string,
	region: RiotRegionalRoute,
) {
	const baseUrl = getRiotApiUrl(region);
	const url = `${baseUrl}/riot/account/v1/region/by-game/lol/by-puuid/${encodeURIComponent(puuid)}`;

	const response = await fetchWithRetry(
		url,
		{
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
			},
		},
		3000,
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as { region: string };
	return data.region as RiotPlatformRoute;
}

export async function getLolAccountDetails(
	puuid: string,
	platform: RiotPlatformRoute,
) {
	const baseUrl = getPlatformApiUrl(platform);
	const url = `${baseUrl}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;

	const response = await fetchWithRetry(
		url,
		{
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
			},
		},
		3000,
	);

	if (!response.ok) {
		const err = (await response.json().catch(() => ({}))) as {
			status?: { message?: string };
		};
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	return (await response.json()) as {
		summonerLevel: number;
		profileIconId: number;
	};
}

export async function getMatchIdsByPuuid(
	puuid: string,
	region: RiotRegionalRoute,
	count = 100,
	queue?: QueueType,
): Promise<string[]> {
	const baseUrl = getRiotApiUrl(region);
	const params = new URLSearchParams({ count: String(count) });
	if (queue !== undefined) params.set("queue", String(queue));

	const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${params}`;

	const response = await fetchWithRetry(
		url,
		{
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
			},
		},
		10000,
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as string[];
	return data;
}

export async function getMatchById(matchId: string, region: RiotRegionalRoute) {
	const baseUrl = getRiotApiUrl(region);
	const url = `${baseUrl}/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
	const response = await fetchWithRetry(
		url,
		{
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
			},
		},
		3000,
	);

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(
			err.status?.message ?? `Riot API error: ${response.status}`,
		);
	}

	const data = (await response.json()) as MatchResponse;
	return data;
}
