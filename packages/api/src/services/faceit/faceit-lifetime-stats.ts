import type {
  FaceitLifetimeStatMap,
  ParsedFaceitLifetimeStats,
} from "@repo/types";

import { coerceFaceitNumericValue } from "./faceit-stats";

function readLifetimeNumber(
  lifetime: FaceitLifetimeStatMap,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const raw = lifetime[key];
    const parsed = coerceFaceitNumericValue(raw);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

export function parseFaceitLifetimeStats(
  lifetime: FaceitLifetimeStatMap | null | undefined,
): ParsedFaceitLifetimeStats | null {
  if (!lifetime) {
    return null;
  }

  const totalMatches = readLifetimeNumber(lifetime, ["Matches", "matches"]);
  const totalWins = readLifetimeNumber(lifetime, ["Wins", "wins"]);
  const winRate = readLifetimeNumber(lifetime, ["Win Rate %", "Win Rate"]);
  const avgKd = readLifetimeNumber(lifetime, [
    "Average K/D Ratio",
    "Average K/D",
  ]);
  const avgAdr = readLifetimeNumber(lifetime, ["ADR", "Average ADR"]);
  const avgHsPct = readLifetimeNumber(lifetime, [
    "Average Headshots %",
    "Average Headshots",
  ]);

  if (
    totalMatches === null &&
    totalWins === null &&
    winRate === null &&
    avgKd === null
  ) {
    return null;
  }

  return {
    totalMatches: totalMatches ?? 0,
    totalWins: totalWins ?? 0,
    winRate,
    avgKd,
    avgAdr,
    avgHsPct,
  };
}
