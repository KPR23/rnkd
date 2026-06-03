import z from "zod";

import { RIOT_REGIONAL_ROUTE } from "@repo/types";

export const riotRegionalRouteSchema = z.enum(RIOT_REGIONAL_ROUTE);
