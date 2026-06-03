const LOL_TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
] as const;

const LOL_DIVISIONS = ["IV", "III", "II", "I"] as const;

const MASTER_PLUS_TIERS = ["MASTER", "GRANDMASTER", "CHALLENGER"] as const;

export const RANKED_SOLO_QUEUE = "RANKED_SOLO_5x5";
export const RANKED_FLEX_QUEUE = "RANKED_FLEX_SR";

type LolDivision = (typeof LOL_DIVISIONS)[number];

function normalizeTier(tier: string): string {
  return tier.toUpperCase();
}

function normalizeRank(rank: string | null | undefined): LolDivision | null {
  if (!rank) return null;
  const upper = rank.toUpperCase();
  if (LOL_DIVISIONS.includes(upper as LolDivision)) {
    return upper as LolDivision;
  }
  return null;
}

function getTierIndex(tier: string): number {
  const normalizedTier = normalizeTier(tier);

  if (
    MASTER_PLUS_TIERS.includes(
      normalizedTier as (typeof MASTER_PLUS_TIERS)[number],
    )
  ) {
    return LOL_TIERS.length;
  }

  const index = LOL_TIERS.indexOf(
    normalizedTier as (typeof LOL_TIERS)[number],
  );
  return index === -1 ? -1 : index;
}

function getDivisionIndex(rank: string | null): number {
  const normalizedRank = normalizeRank(rank);
  if (!normalizedRank) {
    return 0;
  }

  return LOL_DIVISIONS.indexOf(normalizedRank);
}

export function lolRankToSoloPoints(
  tier: string,
  rank: string | null,
  leaguePoints: number,
): number {
  const tierIndex = getTierIndex(tier);
  const divisionIndex = getDivisionIndex(rank);

  if (tierIndex < 0) {
    return 0;
  }

  if (
    tierIndex === 0 &&
    divisionIndex === 0 &&
    normalizeTier(tier) === "IRON"
  ) {
    return Math.max(0, leaguePoints);
  }

  const tierBonus =
    divisionIndex === LOL_DIVISIONS.length - 1 && tierIndex >= 3 ? 100 : 0;

  return tierIndex * 400 + divisionIndex * 100 + leaguePoints + tierBonus;
}

export function lolRankToFlexPoints(
  tier: string,
  rank: string | null,
  leaguePoints: number,
): number {
  const soloPoints = lolRankToSoloPoints(tier, rank, leaguePoints);
  return Math.floor(soloPoints * 0.7);
}

export function faceitEloToPoints(elo: number | null | undefined): number {
  if (elo === null || elo === undefined || !Number.isFinite(elo)) {
    return 0;
  }
  return Math.max(0, Math.trunc(elo));
}

export function computeGlobalRsFromScores(scores: {
  faceitElo?: number | null;
  lolSolo?: { tier: string; rank: string | null; leaguePoints: number } | null;
  lolFlex?: { tier: string; rank: string | null; leaguePoints: number } | null;
}): number {
  let total = faceitEloToPoints(scores.faceitElo);

  if (scores.lolSolo) {
    total += lolRankToSoloPoints(
      scores.lolSolo.tier,
      scores.lolSolo.rank,
      scores.lolSolo.leaguePoints,
    );
  }

  if (scores.lolFlex) {
    total += lolRankToFlexPoints(
      scores.lolFlex.tier,
      scores.lolFlex.rank,
      scores.lolFlex.leaguePoints,
    );
  }

  return total;
}
