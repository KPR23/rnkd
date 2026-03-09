import { Pool, neonConfig } from "@neondatabase/serverless";
import { env } from "@repo/env";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

const globalForDb = globalThis as typeof globalThis & {
	__dbPool?: Pool;
};

const pool =
	globalForDb.__dbPool ?? new Pool({ connectionString: env.DATABASE_URL });
globalForDb.__dbPool ??= pool;

export const db = drizzle({ client: pool, schema });

export * from "./schema";
