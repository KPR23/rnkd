import {
	RIOT_PLATFORM_ROUTE,
	RIOT_REGIONAL_ROUTE,
	RiotPlatformRoute,
	RiotRegionalRoute,
} from "@repo/db";

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

const MAX_ATTEMPTS = 4;

const computeDelayMs = (retryAfter: string | null, attempt: number) => {
	const parsedRetryAfter = retryAfter ? parseInt(retryAfter, 10) : NaN;
	return Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0
		? parsedRetryAfter * 1000
		: Math.pow(2, attempt) * 1000;
};

export async function fetchWithRetry(
	url: string,
	options: Omit<RequestInit, "signal">,
	timeoutMs: number,
): Promise<Response> {
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		try {
			const response = await fetch(url, {
				...options,
				signal: AbortSignal.timeout(timeoutMs),
			});
			if (response.status !== 429 || attempt === MAX_ATTEMPTS - 1)
				return response;
			const retryAfter = response.headers.get("Retry-After");
			const delayMs = computeDelayMs(retryAfter, attempt);
			await new Promise((r) => setTimeout(r, delayMs));
		} catch (error) {
			if (attempt === MAX_ATTEMPTS - 1) {
				throw error;
			}
			const delayMs = computeDelayMs(null, attempt);
			await new Promise((r) => setTimeout(r, delayMs));
		}
	}

	throw new Error("Unreachable: rate limit retries exhausted");
}
export const isValidPlatformRoute = (
	value: string,
): value is RiotPlatformRoute =>
	(RIOT_PLATFORM_ROUTE as readonly string[]).includes(value);
