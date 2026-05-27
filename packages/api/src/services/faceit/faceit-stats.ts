import type { FaceitMatchDetail, FaceitMatchStatsPayload } from "@repo/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeFaceitStatKey(rawKey: string): string {
  return rawKey.toLowerCase().replace(/\s+/g, " ").trim();
}

export function coerceFaceitNumericValue(
  rawVal: string | number | null | undefined,
): number | null {
  if (rawVal === null || rawVal === undefined || rawVal === "") return null;
  if (typeof rawVal === "number" && Number.isFinite(rawVal)) {
    return rawVal;
  }
  const s = String(rawVal).replace("%", "").trim();
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function numericFromPlayerStatsPreferredKeys(
  stats: Record<string, string | number | null | undefined>,
  preferredKeysInOrder: readonly string[],
): number | null {
  const valueByNormalizedKey = new Map<string, number>();
  for (const [rawKey, rawVal] of Object.entries(stats)) {
    const n = coerceFaceitNumericValue(rawVal);
    if (n === null) continue;
    const nk = normalizeFaceitStatKey(rawKey);
    if (!valueByNormalizedKey.has(nk)) valueByNormalizedKey.set(nk, n);
  }
  for (const desired of preferredKeysInOrder) {
    const candidate = valueByNormalizedKey.get(normalizeFaceitStatKey(desired));
    if (candidate !== undefined && Number.isFinite(candidate)) return candidate;
  }
  return null;
}

export function parseNumericStat(
  stats: Record<string, string | number | null | undefined>,
  keyMatchers: RegExp[],
): number | null {
  for (const [rawKey, rawVal] of Object.entries(stats)) {
    if (rawVal === null || rawVal === undefined || rawVal === "") continue;
    const key = normalizeFaceitStatKey(rawKey);
    if (!keyMatchers.some((re) => re.test(key))) continue;
    return coerceFaceitNumericValue(rawVal);
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
          numericFromPlayerStatsPreferredKeys(stats, [
            "Kills",
            "Enemy kills",
            "Total kills",
          ]) ?? 0;
        const deaths =
          numericFromPlayerStatsPreferredKeys(stats, [
            "Deaths",
            "Total deaths",
          ]) ?? 0;
        const assists =
          numericFromPlayerStatsPreferredKeys(stats, [
            "Assists",
            "Total assists",
          ]) ?? 0;

        const adr =
          numericFromPlayerStatsPreferredKeys(stats, [
            "ADR",
            "Average damage per round",
            "Avg damage",
            "Damage / Round",
            "Damage per round",
          ]) ??
          parseNumericStat(stats, [/^dmg\/round$/i]) ??
          null;
        if (adr !== null && adr > 0) {
          entry.adrSamples.push(adr);
        }

        const hsPct =
          numericFromPlayerStatsPreferredKeys(stats, [
            "Headshots %",
            "Headshots percentage",
            "Headshot %",
            "HS %",
          ]) ?? parseNumericStat(stats, [/hs %$/i, /^hs$/i]);
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

function normalizeFaceitMapName(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase().replace(/-\d+$/, "");
  if (normalized.startsWith("de_")) {
    return normalized;
  }

  const slug = normalized.replace(/\s+/g, "_");
  return slug.startsWith("de_") ? slug : `de_${slug}`;
}

export function mapNameFromStatsPayload(
  payload: FaceitMatchStatsPayload | null,
): string | null {
  for (const round of payload?.rounds ?? []) {
    const map = normalizeFaceitMapName(round.round_stats?.Map);
    if (map) return map;
  }
  return null;
}

export function mapNameFromMatchDetail(
  detail: FaceitMatchDetail,
): string | null {
  const entity = detail.voting_map?.entity;
  const fromEntity = normalizeFaceitMapName(
    entity?.game_map_id ?? entity?.guid ?? null,
  );
  if (fromEntity) return fromEntity;

  for (const pick of detail.voting_map?.pick ?? []) {
    const map = normalizeFaceitMapName(pick);
    if (map) return map;
  }

  return null;
}

export function resolveFaceitMapName(
  detail: FaceitMatchDetail,
  statsPayload: FaceitMatchStatsPayload | null,
): string | null {
  return mapNameFromMatchDetail(detail) ?? mapNameFromStatsPayload(statsPayload);
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
