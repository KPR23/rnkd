import { RIOT_REGIONS, RiotRegion } from "./types";

export function getRiotApiUrl(region: RiotRegion) {
	return `https://${region}.api.riotgames.com`;
}

export function assertRiotRegion(region: string): asserts region is RiotRegion {
	if (!RIOT_REGIONS.includes(region as RiotRegion)) {
		throw new Error(`Invalid Riot region: ${region}`);
	}
}
