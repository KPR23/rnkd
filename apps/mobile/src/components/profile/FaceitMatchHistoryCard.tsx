import { Text, View } from "react-native";

import type { Cs2FaceitMatchHistoryRow } from "@repo/types";
import { colors, tagColors } from "@repo/ui/colors";
import Frame from "@/src/components/Frame";
import {
  formatGameDuration,
  formatMatchPlayedAt,
} from "@/src/lib/helper/matchTime";

function formatStat(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}

function statTriple(
  kills: number | null | undefined,
  deaths: number | null | undefined,
  assists: number | null | undefined,
): string {
  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined ||
    assists === null ||
    assists === undefined
  ) {
    return "— / — / —";
  }
  return `${kills} / ${deaths} / ${assists}`;
}

export default function FaceitMatchHistoryCard({
  row,
}: {
  row: Cs2FaceitMatchHistoryRow;
}) {
  const { matches, cs2_faceit_match_players: player } = row;
  const win = player.win;
  const t1 = matches.team1Score;
  const t2 = matches.team2Score;
  const ours = player.team === 1 ? t1 : t2;
  const theirs = player.team === 1 ? t2 : t1;
  const outcomeLabel = win ? "Win" : "Loss";
  const outcomeColor = win ? tagColors.team : colors.destructive;

  const durationLabel = matches.durationSeconds
    ? formatGameDuration(matches.durationSeconds)
    : "—";
  const playedLabel = formatMatchPlayedAt(
    matches.playedAt instanceof Date
      ? matches.playedAt
      : new Date(matches.playedAt),
  );

  const adrLine = `ADR ${formatStat(player.adr, 1)}`;
  const hsLine =
    player.headshotPct !== null &&
    player.headshotPct !== undefined &&
    Number.isFinite(player.headshotPct)
      ? `HS ${formatStat(player.headshotPct, 1)}%`
      : null;

  return (
    <Frame className="w-full flex-row items-stretch justify-between gap-3 p-3!">
      <View className="min-w-0 flex-1 flex-col items-start justify-center">
        <Text
          className="font-sans-semibold text-sm"
          style={{ color: outcomeColor }}
          numberOfLines={1}
        >
          {outcomeLabel}
        </Text>
        <Text
          className="text-text-muted font-sans-medium text-xs tabular-nums"
          numberOfLines={1}
        >
          {ours}–{theirs}
        </Text>
      </View>

      <View className="min-w-0 flex-1 flex-col items-center justify-center">
        <Text className="text-text font-sans-medium text-sm">
          {statTriple(player.kills, player.deaths, player.assists)}
        </Text>
        <Text
          className="text-text-muted font-sans-medium text-xs"
          numberOfLines={1}
        >
          {hsLine !== null ? `${adrLine} · ${hsLine}` : adrLine}
        </Text>
      </View>

      <View className="min-w-0 flex-1 flex-col items-end justify-center">
        <Text className="text-text font-sans-medium text-sm tabular-nums">
          {durationLabel}
        </Text>
        <Text
          className="text-text-muted font-sans-medium text-right text-xs"
          numberOfLines={2}
        >
          {playedLabel}
        </Text>
      </View>
    </Frame>
  );
}
