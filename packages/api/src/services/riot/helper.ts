import { RiotRegion } from "./types";

export function getRiotApiUrl(region: RiotRegion) {
	return `https://${region}.api.riotgames.com`;
}
