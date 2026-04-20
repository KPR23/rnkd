export const RIOT_REGIONAL_ROUTE = [
  "americas",
  "europe",
  "asia",
  "sea",
] as const;
export type RiotRegionalRoute = (typeof RIOT_REGIONAL_ROUTE)[number];

export const RIOT_PLATFORM_ROUTE = [
  "br1",
  "eun1",
  "euw1",
  "jp1",
  "kr",
  "la1",
  "la2",
  "me1",
  "na1",
  "oc1",
  "ru",
  "sg2",
  "tr1",
  "tw2",
  "vn2",
] as const;
export type RiotPlatformRoute = (typeof RIOT_PLATFORM_ROUTE)[number];

export const RIOT_REGION_LABEL: Record<RiotRegionalRoute, string> = {
  americas: "Americas",
  europe: "Europe",
  asia: "Asia",
  sea: "SEA",
};

export const RIOT_PLATFORM_LABEL: Record<RiotPlatformRoute, string> = {
  br1: "BR",
  eun1: "EUNE",
  euw1: "EUW",
  jp1: "JP",
  kr: "KR",
  la1: "LAN",
  la2: "LAS",
  me1: "ME",
  na1: "NA",
  oc1: "OCE",
  ru: "RU",
  sg2: "SG",
  tr1: "TR",
  tw2: "TW",
  vn2: "VN",
};

export const RIOT_PLATFORM_TO_REGIONAL_ROUTE: Record<
  RiotPlatformRoute,
  RiotRegionalRoute
> = {
  br1: "americas",
  eun1: "europe",
  euw1: "europe",
  jp1: "asia",
  kr: "asia",
  la1: "americas",
  la2: "americas",
  me1: "europe",
  na1: "americas",
  oc1: "sea",
  ru: "europe",
  sg2: "sea",
  tr1: "europe",
  tw2: "sea",
  vn2: "sea",
};
