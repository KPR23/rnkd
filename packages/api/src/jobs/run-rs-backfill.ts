import { db } from "@repo/db";

import { recomputeGlobalRs } from "../services/scoring/rnkd-score";

async function main() {
  const users = await db.query.user.findMany({
    columns: { id: true },
  });

  let processed = 0;
  const errors: { userId: string; message: string }[] = [];

  for (const row of users) {
    try {
      await recomputeGlobalRs(row.id);
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ userId: row.id, message });
    }
  }

  console.log(
    JSON.stringify({
      usersChecked: users.length,
      usersProcessed: processed,
      errors,
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
