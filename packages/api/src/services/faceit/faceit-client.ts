import { env } from "@repo/env";
import type {
  FaceitHistoryResponse,
  FaceitMatchDetail,
  FaceitMatchStatsPayload,
  FaceitPlayer,
  FaceitSuggestedPlayer,
} from "@repo/types";

import { faceitBackoffSleep } from "./faceit-stats";

const FACEIT_API_BASE = "https://open.faceit.com/data/v4";

const FACEIT_FETCH_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 4;

function faceitAuthHeaders(): HeadersInit {
  const key = env.FACEIT_API_KEY;
  if (!key?.trim()) {
    throw new Error("FACEIT_API_KEY is not configured");
  }
  return { Authorization: `Bearer ${key}` };
}

async function fetchFaceitJson<T>(url: string): Promise<T | null> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: faceitAuthHeaders(),
        signal: AbortSignal.timeout(FACEIT_FETCH_TIMEOUT_MS),
      });

      if (response.status === 404) return null;

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        if (attempt + 1 >= MAX_RETRIES) {
          throw new Error("FACEIT rate limited (429)");
        }
        await faceitBackoffSleep(attempt, retryAfter);
        continue;
      }

      if (!response.ok) {
        throw new Error(`FACEIT request failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      if (
        err instanceof Error &&
        err.message.includes("FACEIT request failed")
      ) {
        throw err;
      }
      if (attempt + 1 >= MAX_RETRIES) {
        break;
      }
      await faceitBackoffSleep(attempt, null);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "FACEIT request failed"));
}

export async function getFaceitPlayer(
  nickname: string,
): Promise<FaceitPlayer | null> {
  const url = `${FACEIT_API_BASE}/players?nickname=${encodeURIComponent(nickname)}&game=cs2`;

  return await fetchFaceitJson<FaceitPlayer>(url);
}

export async function getFaceitPlayerById(
  playerId: string,
): Promise<FaceitPlayer | null> {
  const url = `${FACEIT_API_BASE}/players/${encodeURIComponent(playerId)}`;

  return await fetchFaceitJson<FaceitPlayer>(url);
}

export async function getFaceitSuggestedPlayers(
  playerId: string,
  limit = 3,
): Promise<FaceitSuggestedPlayer[]> {
  const player = await getFaceitPlayerById(playerId);

  const friendIds = player?.friends_ids?.filter(Boolean).slice(0, limit) ?? [];
  if (friendIds.length === 0) {
    return [];
  }

  const suggestions = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = await getFaceitPlayerById(friendId);
      if (!friend) {
        return null;
      }

      return {
        player_id: friend.player_id,
        nickname: friend.nickname,
        avatar: friend.avatar,
        country: friend.country,
        steam_nickname: friend.steam_nickname,
        games: friend.games,
      } satisfies FaceitSuggestedPlayer;
    }),
  );

  return suggestions.filter((suggestion) => suggestion !== null);
}

export async function getFaceitPlayerHistory(
  playerId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<FaceitHistoryResponse | null> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    game: "cs2",
    limit: String(limit),
    offset: String(offset),
  });
  const url = `${FACEIT_API_BASE}/players/${encodeURIComponent(playerId)}/history?${params}`;

  return await fetchFaceitJson<FaceitHistoryResponse>(url);
}

export async function getFaceitMatch(
  matchId: string,
): Promise<FaceitMatchDetail | null> {
  const url = `${FACEIT_API_BASE}/matches/${encodeURIComponent(matchId)}`;

  return await fetchFaceitJson<FaceitMatchDetail>(url);
}

export async function getFaceitMatchStats(
  matchId: string,
): Promise<FaceitMatchStatsPayload | null> {
  const url = `${FACEIT_API_BASE}/matches/${encodeURIComponent(matchId)}/stats`;

  return await fetchFaceitJson<FaceitMatchStatsPayload>(url);
}
