import z from "zod";

import { RIOT_PLATFORM_ROUTE, RIOT_REGIONAL_ROUTE } from "@repo/types";

export const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);
export const riotPlatformRouteSchema = z.enum(RIOT_PLATFORM_ROUTE);
