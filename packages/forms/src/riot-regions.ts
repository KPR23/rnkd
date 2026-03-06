export const RIOT_REGIONS = ["americas", "europe", "asia", "sea"] as const;
export type RiotRegion = (typeof RIOT_REGIONS)[number];

export const RIOT_REGION_LABELS: Record<RiotRegion, string> = {
	americas: "Americas (NA, BR, LAN, LAS)",
	europe: "Europe (EUW, EUNE, TR, RU)",
	asia: "Asia (KR, JP)",
	sea: "South East Asia",
};
