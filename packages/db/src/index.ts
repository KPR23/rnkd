import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { env } from "@repo/env";

import * as schema from "./schema/index";

neonConfig.webSocketConstructor = ws;

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
};

const pool =
  globalForDb.__dbPool ?? new Pool({ connectionString: env.DATABASE_URL });
globalForDb.__dbPool ??= pool;

export const db = drizzle({ client: pool, schema });

export * from "./schema/index";
export { cs2FaceitRankedEntries } from "./schema/cs2-faceit-ranked";
