export type FaceitAllTimeMetrics = {
  totalMatches: number;
  winRate: number | null;
  avgKd: number | null;
  eloPeak: number | null;
};

export type FaceitRecentRecord = {
  wins: number;
  losses: number;
  played: number;
  winRate: number;
};

export type FaceitRecentPerformance = {
  avgKd: number | null;
  avgHsPct: number | null;
  avgAdr: number | null;
};

export type FaceitMatchPerformanceRow = {
  kills: number | null;
  deaths: number | null;
  adr: number | null;
  headshotPct: number | null;
  win: boolean;
};

export type FaceitMatchKdRow = {
  kills: number | null;
  deaths: number | null;
};
