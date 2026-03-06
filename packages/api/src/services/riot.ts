import { env } from "@repo/env";

const RIOT_API_URL = "https://europe.api.riotgames.com";

export async function getAccountByRiotId(gameName: string, tagLine: string) {
	try {
		const response = await fetch(
			`${RIOT_API_URL}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
			{
				headers: {
					"X-Riot-Token": env.RIOT_API_KEY,
				},
			},
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
