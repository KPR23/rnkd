export const SYNC_POLL_DELAY_MS = 175;

export type SyncError = {
  gameAccountId: string;
  message: string;
};

export type BatchSyncSummary = {
  lolAccounts: number;
  faceitAccounts: number;
  errors: SyncError[];
};

export async function runBatchSync<T extends { id: string }>(
  accounts: T[],
  syncFn: (accountId: string) => Promise<{ ok: boolean; error?: string }>,
): Promise<SyncError[]> {
  const errors: SyncError[] = [];

  for (const account of accounts) {
    try {
      const result = await syncFn(account.id);
      if (!result.ok) {
        errors.push({
          gameAccountId: account.id,
          message: result.error ?? "Sync failed",
        });
      }
    } catch (error) {
      errors.push({
        gameAccountId: account.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, SYNC_POLL_DELAY_MS));
  }

  return errors;
}
