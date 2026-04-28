import { env } from "@repo/env";
import { FaceitPlayer, FaceitSuggestedPlayer } from "@repo/types";

const FACEIT_API_BASE = "https://open.faceit.com/data/v4";

const FACEIT_API_KEY = env.FACEIT_API_KEY;

function headers(): HeadersInit {
  return { Authorization: `Bearer ${FACEIT_API_KEY}` };
}

async function fetchFaceitJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`FACEIT request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getFaceitPlayer(nickname: string): Promise<FaceitPlayer | null> {
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
