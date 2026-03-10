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
