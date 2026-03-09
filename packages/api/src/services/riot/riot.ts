import { env } from "@repo/env";
import { getRiotApiUrl } from "./helper";
import { MatchResponse, QueueType, RiotRegion } from "./types";

const RIOT_API_KEY = env.RIOT_API_KEY;

export async function getAccountByRiotId(
	gameName: string,
	tagLine: string,
	region: RiotRegion,
) {
	const baseUrl = getRiotApiUrl(region);
	const response = await fetch(
		`${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
		{
			signal: AbortSignal.timeout(5000),
			headers: {
				"X-Riot-Token": RIOT_API_KEY,
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

	const response = await fetchWithRetry(url, {
		signal: AbortSignal.timeout(10000),
		headers: {
			"X-Riot-Token": RIOT_API_KEY,
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

async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = 3,
): Promise<Response> {
	for (let attempt = 0; attempt <= retries; attempt++) {
		const response = await fetch(url, options);
		if (response.status !== 429 || attempt === retries) return response;
		const retryAfter = response.headers.get("Retry-After");
		const parsedRetryAfter = retryAfter ? parseInt(retryAfter, 10) : NaN;
		const delayMs =
			Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0
				? parsedRetryAfter * 1000
				: Math.pow(2, attempt) * 1000;
		await new Promise((r) => setTimeout(r, delayMs));
	}
	throw new Error("Rate limit retries exhausted");
}

export async function getMatchById(matchId: string, region: RiotRegion) {
	const baseUrl = getRiotApiUrl(region);
	const url = `${baseUrl}/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
	const response = await fetchWithRetry(url, {
		signal: AbortSignal.timeout(3000),
		headers: {
			"X-Riot-Token": RIOT_API_KEY,
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
