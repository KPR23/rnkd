import type { FaceitMatchDetail, FaceitMatchStatsPayload } from "@repo/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseNumericStat(
  stats: Record<string, string | number | null | undefined>,
  keyMatchers: RegExp[],
): number | null {
  for (const [rawKey, rawVal] of Object.entries(stats)) {
    if (rawVal === null || rawVal === undefined || rawVal === "") continue;
    const key = rawKey.toLowerCase().replace(/\s+/g, " ").trim();
    if (!keyMatchers.some((re) => re.test(key))) continue;
    if (typeof rawVal === "number" && Number.isFinite(rawVal)) {
      return rawVal;
    }
    const s = String(rawVal).replace("%", "").trim();
    const n = Number(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mergePlayerStatsFromRounds(
  payload: FaceitMatchStatsPayload | null,
): Map<
  string,
  {
    kills: number;
    deaths: number;
    assists: number;
    adrSamples: number[];
    headshotPctSamples: number[];
    rawMerged: Record<string, string | number | null>;
  }
> {
  const byPlayer = new Map<
    string,
    {
      kills: number;
      deaths: number;
      assists: number;
      adrSamples: number[];
      headshotPctSamples: number[];
      rawMerged: Record<string, string | number | null>;
    }
  >();

  for (const round of payload?.rounds ?? []) {
    for (const team of round.teams ?? []) {
      for (const pl of team.players ?? []) {
        const id = pl.player_id?.trim();
        if (!id) continue;
        const stats = (pl.player_stats ?? {}) as Record<
          string,
          string | number | null | undefined
        >;
        let entry = byPlayer.get(id);
        if (!entry) {
          entry = {
            kills: 0,
            deaths: 0,
            assists: 0,
            adrSamples: [],
            headshotPctSamples: [],
            rawMerged: {},
          };
          byPlayer.set(id, entry);
        }

        const kills =
          parseNumericStat(stats, [/kills$/i, /^kills$/i, /total kills/i]) ?? 0;
        const deaths = parseNumericStat(stats, [/deaths$/i, /^deaths$/i]) ?? 0;
        const assists =
          parseNumericStat(stats, [/assists$/i, /^assists$/i]) ?? 0;

        const adr =
          parseNumericStat(stats, [
            /^adr$/i,
            /average damage/i,
            /dmg\/round/i,
          ]) ?? parseNumericStat(stats, [/damage per round/i]);
        if (adr !== null && adr > 0) {
          entry.adrSamples.push(adr);
        }

        const hsPct = parseNumericStat(stats, [
          /headshots?/i,
          /hs%/i,
          /headshot%/i,
        ]);
        if (hsPct !== null) {
          entry.headshotPctSamples.push(hsPct);
        }

        entry.kills += Math.max(0, Math.round(kills));
        entry.deaths += Math.max(0, Math.round(deaths));
        entry.assists += Math.max(0, Math.round(assists));

        for (const [k, v] of Object.entries(stats)) {
          if (v === undefined) continue;
          entry.rawMerged[k] =
            typeof v === "number" || v === null ? v : String(v);
        }
      }
    }
  }

  return byPlayer;
}

export function buildFaceitPlayerTeamIndex(
  detail: FaceitMatchDetail,
): Record<string, number> {
  const teams = detail.teams ?? {};
  const keys = Object.keys(teams);
  const out: Record<string, number> = {};
  keys.forEach((k, idx) => {
    const block = teams[k];
    const roster = [...(block?.roster ?? []), ...(block?.roster_v1 ?? [])];
    for (const r of roster) {
      if (r.player_id) {
        if (out[r.player_id] !== undefined) {
          // Preserve the first team assignment when FACEIT returns duplicate roster entries.
          continue;
        }
        out[r.player_id] = idx + 1;
      }
    }
  });
  return out;
}

export function resolveFaceitWinningTeamOneBased(
  detail: FaceitMatchDetail,
): number | null {
  const winnerKey = detail.results?.winner;
  const keys = Object.keys(detail.teams ?? {});
  const scoreMap = detail.results?.score ?? {};

  if (winnerKey) {
    const idx = keys.indexOf(winnerKey);
    if (idx >= 0) {
      return idx + 1;
    }
  }

  if (keys.length >= 2) {
    const k0 = keys[0];
    const k1 = keys[1];
    if (k0 && k1) {
      const s0 = scoreMap[k0];
      const s1 = scoreMap[k1];
      if (typeof s0 === "number" && typeof s1 === "number" && s0 !== s1) {
        return s0 > s1 ? 1 : 2;
      }
    }
  }

  return null;
}

export function didPlayerWin(
  detail: FaceitMatchDetail,
  playerTeam: number,
): boolean {
  const w = resolveFaceitWinningTeamOneBased(detail);
  if (w === null) return false;
  return w === playerTeam;
}

export async function faceitBackoffSleep(
  attempt: number,
  retryAfterHeader?: string | null,
) {
  let ms = 600 * 2 ** attempt;
  if (retryAfterHeader) {
    const sec = Number(retryAfterHeader);
    if (!Number.isNaN(sec) && sec > 0) {
      ms = Math.max(ms, sec * 1000);
    }
  }
  ms = Math.min(ms, 30_000);
  await sleep(ms);
}
