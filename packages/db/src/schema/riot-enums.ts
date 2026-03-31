import { pgEnum } from "drizzle-orm/pg-core";

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

export const regionalRouteEnum = pgEnum("regional_route", RIOT_REGIONAL_ROUTE);
export const platformRouteEnum = pgEnum("platform_route", RIOT_PLATFORM_ROUTE);
