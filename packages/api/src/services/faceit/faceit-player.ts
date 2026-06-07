import type { getFaceitPlayerById } from "./faceit-client";

export function resolveCs2FaceitElo(
  player: Awaited<ReturnType<typeof getFaceitPlayerById>>,
): number {
  const cs2 = player?.games?.cs2;
  if (cs2?.faceit_elo !== null && cs2?.faceit_elo !== undefined) {
    return cs2.faceit_elo;
  }

  const fallback = Object.values(player?.games ?? {}).find(
    (game) => game?.faceit_elo !== null && game?.faceit_elo !== undefined,
  );

  return fallback?.faceit_elo ?? 0;
}
