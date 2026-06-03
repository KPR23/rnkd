import { GAMES } from "@repo/db";

import { findTrackedGameAccountsByUserId } from "../../repositories/game-accounts.repo";
import { syncLatestFaceitMatchForAccount } from "../faceit/faceit-latest-match-sync";
import { syncLatestLolMatchForAccount } from "../riot/lol-latest-match-sync";
import { runBatchSync, type BatchSyncSummary } from "./run-batch";

export async function syncTrackedAccountsForUser(
  userId: string,
): Promise<BatchSyncSummary> {
  const accounts = await findTrackedGameAccountsByUserId(userId);
  const lolAccounts = accounts.filter((account) => account.gameId === GAMES.LOL);
  const faceitAccounts = accounts.filter(
    (account) => account.gameId === GAMES.CS2_FACEIT,
  );

  const lolErrors = await runBatchSync(lolAccounts, syncLatestLolMatchForAccount);
  const faceitErrors = await runBatchSync(
    faceitAccounts,
    syncLatestFaceitMatchForAccount,
  );

  return {
    lolAccounts: lolAccounts.length,
    faceitAccounts: faceitAccounts.length,
    errors: [...lolErrors, ...faceitErrors],
  };
}
