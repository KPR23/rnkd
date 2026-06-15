export function formatMatchKd(
  kills: number | null | undefined,
  deaths: number | null | undefined,
): string {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined
  ) {
    return "—";
  }
  const ratio = deaths > 0 ? kills / deaths : kills;
  return ratio.toFixed(2);
}

export function formatMatchKda(
  kills: number | null | undefined,
  deaths: number | null | undefined,
  assists: number | null | undefined,
): string {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined ||
    assists === null ||
    assists === undefined
  ) {
    return "—";
  }
  return `${kills}/${deaths}/${assists}`;
}

export function formatSkillLevelLabel(
  skillLevel: number | null | undefined,
): string {
  if (skillLevel === null || skillLevel === undefined || skillLevel === 0) {
    return "Unranked";
  }
  return `Level ${skillLevel}`;
}
