import { env } from "@repo/env";

export const RIOT_REGIONS = ["americas", "europe", "asia", "sea"] as const;
export type RiotRegion = (typeof RIOT_REGIONS)[number];

function getRiotApiUrl(region: RiotRegion) {
	return `https://${region}.api.riotgames.com`;
}

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
					"X-Riot-Token": env.RIOT_API_KEY,
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
