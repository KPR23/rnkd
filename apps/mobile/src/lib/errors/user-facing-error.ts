type ErrorLike = {
  message?: string | null;
  status?: number | null;
  data?: {
    code?: string | null;
    httpStatus?: number | null;
  } | null;
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "Something looks incorrect. Check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to do that.",
  404: "We couldn't find what you were looking for.",
  408: "The request took too long. Please try again.",
  409: "This action conflicts with existing data. Please refresh and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
  502: "The server is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again shortly.",
};

const TRPC_CODE_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "Something looks incorrect. Check your input and try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to do that.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  CONFLICT:
    "This action conflicts with existing data. Please refresh and try again.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a moment and try again.",
  INTERNAL_SERVER_ERROR:
    "Something went wrong on our side. Please try again shortly.",
  TIMEOUT: "The server took too long to respond. Please try again shortly.",
};

const TECHNICAL_ERROR_PATTERNS = [
  /HTTP\s+\d{3}/i,
  /\b\d{3}\b/,
  /TRPCClientError/i,
  /Network request failed/i,
  /Failed to fetch/i,
  /Load failed/i,
  /timeout/i,
];

function statusFromMessage(message: string) {
  const match = message.match(
    /\b(400|401|403|404|408|409|429|500|502|503|504)\b/,
  );
  return match?.[1] ? Number(match[1]) : null;
}

function isTechnicalMessage(message: string) {
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function getUserFacingErrorMessage(
  error: ErrorLike | Error | string | unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (typeof error === "string") {
    const trimmed = error.trim();
    const status = statusFromMessage(trimmed);

    if (status && STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }

    if (isTechnicalMessage(trimmed)) {
      return fallback;
    }

    return trimmed || fallback;
  }

  if (error && typeof error === "object") {
    const candidate = error as ErrorLike;
    const status = candidate.status ?? candidate.data?.httpStatus ?? null;
    const code = candidate.data?.code ?? null;

    if (status && STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }

    if (code && TRPC_CODE_MESSAGES[code]) {
      return TRPC_CODE_MESSAGES[code];
    }

    if (candidate.message) {
      return getUserFacingErrorMessage(candidate.message, fallback);
    }
  }

  return fallback;
}
