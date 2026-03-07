import { env } from "@repo/env";
import { RiotRegion } from "./types";

export function getRiotApiUrl(region: RiotRegion) {
	return `https://${region}.api.riotgames.com`;
}

export function getRiotApiKey(): string {
	const key = env.RIOT_API_KEY;
	if (!key) throw new Error("RIOT_API_KEY is not set");
	return key;
}
