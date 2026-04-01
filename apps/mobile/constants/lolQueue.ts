const LOL_QUEUE_LABELS: Record<number, string> = {
	0: "Custom",
	400: "Normal draft",
	420: "Ranked Solo/Duo",
	430: "Quickplay",
	440: "Ranked Flex",
	450: "ARAM",
	700: "Clash",
	720: "ARAM Clash",
	900: "URF",
	1020: "Clash",
	1300: "Nexus Blitz",
	1400: "Ultimate Spellbook",
	1700: "Arena",
	1900: "Pick URF",
	2000: "Tutorial 1",
	2010: "Tutorial 2",
	2020: "Tutorial 3",
};

export function formatLolQueueLabel(
	queueId: number | null | undefined,
): string {
	if (queueId == null) {
		return "—";
	}
	return LOL_QUEUE_LABELS[queueId] ?? `Queue ${queueId}`;
}
