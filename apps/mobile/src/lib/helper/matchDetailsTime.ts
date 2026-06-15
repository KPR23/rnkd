export function formatMatchDetailsDateTime(playedAt: Date): string {
  if (Number.isNaN(playedAt.getTime())) {
    return "—";
  }

  const day = String(playedAt.getDate()).padStart(2, "0");
  const month = String(playedAt.getMonth() + 1).padStart(2, "0");
  const year = playedAt.getFullYear();
  const hours = String(playedAt.getHours()).padStart(2, "0");
  const minutes = String(playedAt.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}
