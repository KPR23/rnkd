import { env } from "@repo/env";
import { FaceitPlayer } from "@repo/types";

const FACEIT_API_BASE = "https://open.faceit.com/data/v4";

const FACEIT_API_KEY = env.FACEIT_API_KEY;

function headers(): HeadersInit {
  return { Authorization: `Bearer ${FACEIT_API_KEY}` };
}

export async function getFaceitPlayer(
  nickname: string,
): Promise<FaceitPlayer | null> {
  const url = `${FACEIT_API_BASE}/players?nickname=${encodeURIComponent(nickname)}&game=cs2`;

  const response = await fetch(url, { headers: headers() });

  if (response.status === 404) return null;
  console.log("LOG" + response.status);
  if (!response.ok)
    throw new Error(`FACEIT player lookup failed: ${response.status}`);

  return (await response.json()) as FaceitPlayer;
}
