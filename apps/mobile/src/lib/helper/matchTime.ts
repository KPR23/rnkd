export function formatGameDuration(seconds: number | null | undefined): string {
	if (seconds == null || seconds < 0) {
		return "—";
	}
	const total = Math.floor(seconds);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function formatMatchPlayedAt(playedAt: Date): string {
	if (Number.isNaN(playedAt.getTime())) {
		return "—";
	}
	return playedAt.toLocaleString("en-GB", {
		day: "numeric",
		month: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
