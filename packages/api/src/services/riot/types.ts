export const RIOT_REGIONS = ["americas", "europe", "asia", "sea"] as const;
export type RiotRegion = (typeof RIOT_REGIONS)[number];

export const RIOT_QUEUE_IDS = [
	400, 420, 430, 440, 450, 700, 720, 900, 1400, 1700, 1900, 2000, 2010, 2020,
] as const;
export type QueueType = (typeof RIOT_QUEUE_IDS)[number];
