import {
	RIOT_REGIONAL_ROUTE,
	RiotPlatformRoute,
	RiotRegionalRoute,
} from "./types";

export function getRiotApiUrl(region: RiotRegionalRoute) {
	return `https://${region}.api.riotgames.com`;
}

export function getPlatformApiUrl(platform: RiotPlatformRoute | string) {
	return `https://${String(platform).toLowerCase()}.api.riotgames.com`;
}

export function assertRiotRegion(
	region: string,
): asserts region is RiotRegionalRoute {
	if (!RIOT_REGIONAL_ROUTE.includes(region as RiotRegionalRoute)) {
		throw new Error(`Invalid Riot region: ${region}`);
	}
}

const RETRIES = 3;

export async function fetchWithRetry(
	url: string,
	options: Omit<RequestInit, "signal">,
	timeoutMs: number,
): Promise<Response> {
	for (let attempt = 0; attempt <= RETRIES; attempt++) {
		const response = await fetch(url, {
			...options,
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (response.status !== 429 || attempt === RETRIES) return response;
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
