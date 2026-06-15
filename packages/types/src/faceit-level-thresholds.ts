export type FaceitLevelProgress = {
  level: number;
  points: number;
  levelStart: number;
  levelEnd: number | null;
  pointsToNextLevel: number | null;
};

export type FaceitLevelThreshold = {
  level: number;
  min: number;
  max: number | null;
};

export const FACEIT_LEVEL_THRESHOLDS: readonly FaceitLevelThreshold[] = [
  { level: 1, min: 100, max: 500 },
  { level: 2, min: 501, max: 750 },
  { level: 3, min: 751, max: 900 },
  { level: 4, min: 901, max: 1050 },
  { level: 5, min: 1051, max: 1200 },
  { level: 6, min: 1201, max: 1350 },
  { level: 7, min: 1351, max: 1530 },
  { level: 8, min: 1531, max: 1750 },
  { level: 9, min: 1751, max: 2000 },
  { level: 10, min: 2001, max: null },
] as const;

export function getFaceitLevelFromElo(elo: number): number {
  if (!Number.isFinite(elo) || elo < 100) {
    return 0;
  }

  for (const threshold of FACEIT_LEVEL_THRESHOLDS) {
    if (threshold.max === null) {
      if (elo >= threshold.min) {
        return threshold.level;
      }
      continue;
    }

    if (elo >= threshold.min && elo <= threshold.max) {
      return threshold.level;
    }
  }

  return 0;
}

export function getFaceitLevelProgress(elo: number): FaceitLevelProgress {
  const level = getFaceitLevelFromElo(elo);
  const threshold: FaceitLevelThreshold =
    FACEIT_LEVEL_THRESHOLDS.find((entry) => entry.level === level) ??
    FACEIT_LEVEL_THRESHOLDS.find((entry) => entry.level === 1) ??
    FACEIT_LEVEL_THRESHOLDS[0] ?? { level: 1, min: 100, max: 500 };

  const levelEnd = threshold.max === null ? null : threshold.max + 1;
  const pointsToNextLevel =
    threshold.max === null ? null : Math.max(0, threshold.max + 1 - elo);

  return {
    level,
    points: elo,
    levelStart: threshold.min,
    levelEnd,
    pointsToNextLevel,
  };
}

export function getFaceitLevelWindow(
  currentLevel: number,
  windowSize = 5,
): FaceitLevelThreshold[] {
  if (windowSize <= 0) return [];

  const levels = FACEIT_LEVEL_THRESHOLDS.map((entry) => entry.level);
  const minLevel = levels[0] ?? 1;
  const maxLevel = levels[levels.length - 1] ?? 10;
  const clampedLevel = Math.min(
    maxLevel,
    Math.max(minLevel, currentLevel || minLevel),
  );

  let start = clampedLevel - Math.floor(windowSize / 2);
  if (start < minLevel) {
    start = minLevel;
  }
  let end = start + windowSize - 1;
  if (end > maxLevel) {
    end = maxLevel;
    start = Math.max(minLevel, end - windowSize + 1);
  }

  return FACEIT_LEVEL_THRESHOLDS.filter(
    (entry) => entry.level >= start && entry.level <= end,
  );
}
