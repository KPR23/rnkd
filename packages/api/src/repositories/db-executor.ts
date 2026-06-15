import { db } from "@repo/db";

export type DbExecutor = Pick<
  typeof db,
  "query" | "select" | "update" | "insert" | "delete"
>;
