import type { GameAccounts } from "./game";

export type FaceitLevelProgress = {
  level: number;
  points: number;
  levelStart: number;
  levelEnd: number | null;
  pointsToNextLevel: number | null;
};

export type MatchActivityDay = {
  date: string;
  played: boolean;
};

export type ProfileOverview = {
  user: {
    id: string;
    name: string;
    tag: string | null;
    image: string | null;
    bio: string | null;
    region: string | null;
    globalRs: number;
    favoriteGame: { id: string; name: string } | null;
  };
  gameAccounts: GameAccounts;
  lastActiveAt: Date | null;
};
