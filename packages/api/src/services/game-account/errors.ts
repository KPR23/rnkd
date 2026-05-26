export function isGameAccountUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
  };

  const constraint = err.constraint ?? err.cause?.constraint;

  if (constraint === "game_accounts_game_external_unique") return true;

  return false;
}
