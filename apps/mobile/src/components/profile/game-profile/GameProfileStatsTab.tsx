import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  CaretLeftIcon,
  CaretRightIcon,
  FadersHorizontalIcon,
} from "phosphor-react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import type {
  Cs2FaceitGameAccount,
  Cs2FaceitMatchHistoryRow,
  FaceitLevelProgress,
  FaceitRecentPerformance,
  FaceitRecentRecord,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import CustomModal from "@/src/components/Modal";
import GameProfileHeaderCard from "@/src/components/profile/game-profile/GameProfileHeaderCard";
import GameProfileSectionTitle from "@/src/components/profile/game-profile/GameProfileSectionTitle";
import { formatMapDisplayName } from "@/src/lib/helper/formatMapName";

const RECENT_MATCH_WINDOW = 30;

const DEFAULT_MAP_ORDER = [
  "Mirage",
  "Ancient",
  "Inferno",
  "Dust 2",
  "Anubis",
  "Nuke",
  "Overpass",
];

const MAP_NAME_ALIASES: Record<string, string> = {
  Dust2: "Dust 2",
  "Dust Ii": "Dust 2",
};

type DisplayData = {
  primaryRanked: { skillLevel: number | null; faceitElo: number | null } | null;
  levelProgress: FaceitLevelProgress | null;
  allTimeMetrics: {
    totalMatches: number;
    winRate: number | null;
    avgKd: number | null;
    eloPeak: number | null;
  };
  recentRecord?: FaceitRecentRecord | null;
  recentPerformance?: FaceitRecentPerformance | null;
};

type ComputedStats = {
  played: number;
  winRate: number | null;
  avgKd: number | null;
  peakKd: number | null;
  avgAdr: number | null;
  highestAdr: number | null;
  avgHeadshotPct: number | null;
  avgKr: number | null;
  kdSeries: number[];
  adrSeries: number[];
  headshotSeries: number[];
  krSeries: number[];
  maps: MapStatRow[];
};

type MapStatRow = {
  name: string;
  games: number;
  winRate: number | null;
};

type MatchRange = {
  label: string;
  start: number;
  end: number;
};

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatValue(
  value: number | null | undefined,
  formatter: (value: number) => string,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return formatter(value);
}

function getKd(row: Cs2FaceitMatchHistoryRow): number | null {
  const { kills, deaths } = row.cs2_faceit_match_players;

  if (
    kills === null ||
    kills === undefined ||
    deaths === null ||
    deaths === undefined
  ) {
    return null;
  }

  return deaths > 0 ? kills / deaths : kills;
}

function getRounds(row: Cs2FaceitMatchHistoryRow): number | null {
  const rounds = row.matches.team1Score + row.matches.team2Score;
  return rounds > 0 ? rounds : null;
}

function formatStatsMapName(mapName: string | null | undefined): string {
  const displayName = formatMapDisplayName(mapName);
  return MAP_NAME_ALIASES[displayName] ?? displayName;
}

function computeStats(
  matchHistory: Cs2FaceitMatchHistoryRow[] | undefined,
  rangeStart: number,
): ComputedStats {
  const recentRows = (matchHistory ?? []).slice(
    rangeStart,
    rangeStart + RECENT_MATCH_WINDOW,
  );
  const wins = recentRows.filter((row) => row.cs2_faceit_match_players.win);

  const kdSeries = recentRows
    .map((row) => getKd(row))
    .filter((value): value is number => value !== null);
  const adrSeries = recentRows
    .map((row) => row.cs2_faceit_match_players.adr)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
  const headshotSeries = recentRows
    .map((row) => row.cs2_faceit_match_players.headshotPct)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
  const krSeries = recentRows
    .map((row) => {
      const rounds = getRounds(row);
      const kills = row.cs2_faceit_match_players.kills;

      if (rounds === null || kills === null || kills === undefined) {
        return null;
      }

      return kills / rounds;
    })
    .filter((value): value is number => value !== null);

  const mapStats = new Map<string, { games: number; wins: number }>();

  for (const mapName of DEFAULT_MAP_ORDER) {
    mapStats.set(mapName, { games: 0, wins: 0 });
  }

  for (const row of recentRows) {
    const mapName = formatStatsMapName(row.matches.mapName);
    const current = mapStats.get(mapName) ?? { games: 0, wins: 0 };
    current.games += 1;
    current.wins += row.cs2_faceit_match_players.win ? 1 : 0;
    mapStats.set(mapName, current);
  }

  const maps = [...mapStats.entries()]
    .map(([name, stat]) => ({
      name,
      games: stat.games,
      winRate: stat.games > 0 ? (stat.wins / stat.games) * 100 : null,
    }))
    .sort((a, b) => {
      const aDefault = DEFAULT_MAP_ORDER.indexOf(a.name);
      const bDefault = DEFAULT_MAP_ORDER.indexOf(b.name);

      if (aDefault >= 0 && bDefault >= 0) {
        return aDefault - bDefault;
      }

      if (aDefault >= 0) return -1;
      if (bDefault >= 0) return 1;
      return b.games - a.games;
    });

  return {
    played: recentRows.length,
    winRate:
      recentRows.length > 0 ? (wins.length / recentRows.length) * 100 : null,
    avgKd: average(kdSeries),
    peakKd: kdSeries.length > 0 ? Math.max(...kdSeries) : null,
    avgAdr: average(adrSeries),
    highestAdr: adrSeries.length > 0 ? Math.max(...adrSeries) : null,
    avgHeadshotPct: average(headshotSeries),
    avgKr: average(krSeries),
    kdSeries,
    adrSeries,
    headshotSeries,
    krSeries,
    maps,
  };
}

function buildSparklinePath(
  series: number[],
  width: number,
  height: number,
): string {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const normalized = (value - min) / range;
      const y = height - normalized * (height - 10) - 5;

      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function TrendLine({
  series,
  flipped = false,
}: {
  series: number[];
  flipped?: boolean;
}) {
  const width = 238;
  const height = 52;

  if (series.length < 2) {
    return null;
  }

  const path = buildSparklinePath(series, width, height);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.sparklineWrap,
        flipped ? styles.sparklineFlipped : undefined,
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="sparklineFade" x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0"
              stopColor={colors.textSecondary}
              stopOpacity="0.08"
            />
            <Stop
              offset="0.42"
              stopColor={colors.textSecondary}
              stopOpacity="0.5"
            />
            <Stop
              offset="1"
              stopColor={colors.textSecondary}
              stopOpacity="0.04"
            />
          </LinearGradient>
        </Defs>
        <Path
          d={path}
          fill="none"
          stroke="url(#sparklineFade)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

function SmallStatCard({
  label,
  value,
  suffix,
  prefixMuted,
}: {
  label: string;
  value: string;
  suffix?: string;
  prefixMuted?: string;
}) {
  return (
    <View className="border-muted bg-card min-w-0 flex-1 border px-4 pt-4 pb-3">
      <AppText
        className="text-base leading-[22px]"
        weight="medium"
        color={colors.textSecondary}
      >
        {label}
      </AppText>
      <View className="mt-2 flex-row items-end">
        {prefixMuted ? (
          <AppText
            className="text-[32px] leading-[36px]"
            weight="medium"
            color={colors.textSecondary}
          >
            {prefixMuted}
          </AppText>
        ) : null}
        <AppText className="text-[32px] leading-[36px]" weight="medium">
          {value}
        </AppText>
        {suffix ? (
          <AppText
            className="text-xl leading-[34px]"
            weight="medium"
            color={colors.textSecondary}
          >
            {suffix}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function LargeStatCard({
  label,
  value,
  suffix,
  subtitle,
  series,
  flipped,
}: {
  label: string;
  value: string;
  suffix?: string;
  subtitle: string;
  series: number[];
  flipped?: boolean;
}) {
  return (
    <View className="border-muted bg-card relative min-h-[90px] overflow-hidden border p-4">
      <AppText className="text-base leading-[22px]" weight="medium">
        {label}
      </AppText>
      <TrendLine series={series} flipped={flipped} />
      <View className="relative z-10 mt-3 items-end">
        <View className="flex-row items-end">
          <AppText className="text-[32px] leading-[36px]" weight="medium">
            {value}
          </AppText>
          {suffix ? (
            <AppText
              className="text-xl leading-[34px]"
              weight="medium"
              color={colors.textSecondary}
            >
              {suffix}
            </AppText>
          ) : null}
        </View>
        <AppText
          className="text-sm leading-5"
          color={colors.textSecondary}
          numberOfLines={1}
        >
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

function buildRangeOptions(matchCount: number): MatchRange[] {
  const options: MatchRange[] = [];

  for (let start = 0; start < matchCount; start += RECENT_MATCH_WINDOW) {
    const end = Math.min(start + RECENT_MATCH_WINDOW, matchCount);

    options.push({
      start,
      end,
      label:
        start === 0 ? `Last ${end} matches` : `Matches ${start + 1}-${end}`,
    });
  }

  return options.length > 0
    ? options
    : [{ label: "No matches loaded", start: 0, end: 0 }];
}

function StatsRangeSelector({
  ranges,
  activeStart,
  onSelectRange,
}: {
  ranges: MatchRange[];
  activeStart: number;
  onSelectRange: (start: number) => void;
}) {
  const [isRangeMenuVisible, setIsRangeMenuVisible] = useState(false);
  const activeRange = ranges.find((range) => range.start === activeStart);
  const canMoveOlder = ranges.some((range) => range.start > activeStart);
  const canMoveNewer = activeStart > 0;

  const moveOlder = () => {
    const olderRange = ranges.find((range) => range.start > activeStart);

    if (olderRange) {
      onSelectRange(olderRange.start);
    }
  };

  const moveNewer = () => {
    const newerRanges = ranges.filter((range) => range.start < activeStart);
    const newerRange = newerRanges[newerRanges.length - 1];

    if (newerRange) {
      onSelectRange(newerRange.start);
    }
  };

  return (
    <>
      <View className="flex-row items-center justify-center gap-5">
        <Pressable
          disabled={!canMoveOlder}
          className={`h-6 w-6 items-center justify-center ${canMoveOlder ? "" : "opacity-20"}`}
          onPress={moveOlder}
          accessibilityRole="button"
          accessibilityLabel="Show older match range"
        >
          <CaretLeftIcon color={colors.text} size={22} weight="regular" />
        </Pressable>
        <Pressable
          className="border-gray bg-button flex-row items-center justify-center gap-1 rounded-full border px-3 py-1.5"
          onPress={() => setIsRangeMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Select match range"
        >
          <AppText className="text-sm leading-5" weight="medium">
            {activeRange?.label ?? "Select range"}
          </AppText>
          <FadersHorizontalIcon
            color={colors.textSecondary}
            size={18}
            weight="regular"
          />
        </Pressable>
        <Pressable
          disabled={!canMoveNewer}
          className={`h-6 w-6 items-center justify-center ${canMoveNewer ? "" : "opacity-20"}`}
          onPress={moveNewer}
          accessibilityRole="button"
          accessibilityLabel="Show newer match range"
        >
          <CaretRightIcon color={colors.text} size={22} weight="regular" />
        </Pressable>
      </View>

      <CustomModal
        visible={isRangeMenuVisible}
        onClose={() => setIsRangeMenuVisible(false)}
        title="Select range"
      >
        <View className="flex-col gap-2">
          {ranges.map((range) => {
            const isActive = range.start === activeStart;

            return (
              <Pressable
                key={`${range.start}-${range.end}`}
                disabled={range.end === 0}
                className={`border px-4 py-4 ${
                  isActive ? "border-gray bg-button" : "border-muted bg-card"
                }`}
                onPress={() => {
                  onSelectRange(range.start);
                  setIsRangeMenuVisible(false);
                }}
                accessibilityRole="button"
              >
                <View className="flex-row items-center justify-between">
                  <AppText
                    className="text-base leading-[22px]"
                    weight="medium"
                    color={range.end === 0 ? colors.textSecondary : colors.text}
                  >
                    {range.label}
                  </AppText>
                  {range.end > 0 ? (
                    <AppText
                      className="text-sm leading-5"
                      color={colors.textSecondary}
                    >
                      {range.end - range.start} matches
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </CustomModal>
    </>
  );
}

function MapStatisticsTable({ maps }: { maps: MapStatRow[] }) {
  return (
    <View className="flex-col gap-2">
      <GameProfileSectionTitle title="Map statistics" />
      <View className="flex-col gap-1.5">
        <View className="border-muted bg-card border px-3.5 py-2.5">
          <View className="flex-row items-center">
            <View style={styles.mapColumn}>
              <AppText
                className="text-sm"
                weight="medium"
                color={colors.textSecondary}
              >
                Map
              </AppText>
            </View>
            <View style={styles.gamesColumn}>
              <AppText
                className="text-center text-sm"
                weight="medium"
                color={colors.textSecondary}
              >
                Games played
              </AppText>
            </View>
            <View style={styles.winColumn}>
              <AppText
                className="text-right text-sm"
                weight="medium"
                color={colors.textSecondary}
              >
                Win %
              </AppText>
            </View>
          </View>
        </View>
        {maps.map((map) => {
          const isEmpty = map.games === 0;
          const winRateColor =
            map.winRate === null
              ? colors.muted
              : map.winRate >= 50
                ? colors.success
                : colors.destructive;

          return (
            <View
              key={map.name}
              className={`border-muted border px-3.5 py-4 ${isEmpty ? "bg-background" : "bg-card"}`}
            >
              <View className="flex-row items-center">
                <View style={styles.mapColumn}>
                  <AppText
                    className="text-base leading-[22px]"
                    weight="medium"
                    color={isEmpty ? colors.muted : colors.text}
                    numberOfLines={1}
                  >
                    {map.name}
                  </AppText>
                </View>
                <View style={styles.gamesColumn}>
                  <AppText
                    className="text-center text-sm leading-5"
                    color={isEmpty ? colors.muted : colors.textSecondary}
                    numberOfLines={1}
                  >
                    {map.games} {map.games === 1 ? "game" : "games"}
                  </AppText>
                </View>
                <View style={styles.winColumn}>
                  <AppText
                    className="text-right text-sm leading-5"
                    color={winRateColor}
                    numberOfLines={1}
                  >
                    {map.winRate === null ? "-" : `${map.winRate.toFixed(0)}%`}
                  </AppText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function GameProfileStatsTab({
  gameAccount,
  display,
  matchHistory,
  isMatchHistoryLoading,
}: {
  gameAccount: Cs2FaceitGameAccount;
  display: DisplayData | undefined;
  matchHistory: Cs2FaceitMatchHistoryRow[] | undefined;
  isMatchHistoryLoading: boolean;
}) {
  const [rangeStart, setRangeStart] = useState(0);
  const matchCount = matchHistory?.length ?? 0;
  const ranges = useMemo(() => buildRangeOptions(matchCount), [matchCount]);
  const selectedRangeStart = ranges.some((range) => range.start === rangeStart)
    ? rangeStart
    : 0;
  const stats = useMemo(
    () => computeStats(matchHistory, selectedRangeStart),
    [matchHistory, selectedRangeStart],
  );

  if (isMatchHistoryLoading && !matchHistory) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-col gap-5">
      <GameProfileHeaderCard
        gameAccount={gameAccount}
        skillLevel={display?.primaryRanked?.skillLevel ?? null}
      />

      <StatsRangeSelector
        ranges={ranges}
        activeStart={selectedRangeStart}
        onSelectRange={setRangeStart}
      />

      <View className="flex-col gap-3">
        <View className="flex-row gap-3">
          <SmallStatCard
            label="Winrate"
            value={formatValue(stats.winRate, (value) => value.toFixed(0))}
            suffix="%"
          />
          <SmallStatCard label="ELO change" value="—" />
        </View>

        <LargeStatCard
          label="Avg K/D"
          value={formatValue(stats.avgKd, (value) => value.toFixed(2))}
          subtitle={`Peaked at ${formatValue(stats.peakKd, (value) => value.toFixed(2))} K/D`}
          series={stats.kdSeries}
          flipped
        />
        <LargeStatCard
          label="ADR"
          value={formatValue(stats.avgAdr, (value) => value.toFixed(1))}
          suffix=" dmg"
          subtitle={`Highest: ${formatValue(stats.highestAdr, (value) => value.toFixed(0))} ADR`}
          series={stats.adrSeries}
        />
        <LargeStatCard
          label="Headshot %"
          value={formatValue(stats.avgHeadshotPct, (value) => value.toFixed(0))}
          suffix="%"
          subtitle={`${stats.played > 0 ? stats.played : "No"} matches in selected range`}
          series={stats.headshotSeries}
          flipped
        />
        <LargeStatCard
          label="K/R"
          value={formatValue(stats.avgKr, (value) => value.toFixed(2))}
          subtitle="Kills per round"
          series={stats.krSeries}
        />
      </View>

      <MapStatisticsTable maps={stats.maps} />
    </View>
  );
}

const styles = StyleSheet.create({
  gamesColumn: {
    alignItems: "center",
    flexBasis: "36%",
  },
  mapColumn: {
    flexBasis: "42%",
    minWidth: 0,
  },
  sparklineWrap: {
    left: 15,
    opacity: 0.75,
    position: "absolute",
    top: 52,
    zIndex: 0,
  },
  sparklineFlipped: {
    transform: [{ scaleY: -1 }],
  },
  winColumn: {
    alignItems: "flex-end",
    flexBasis: "22%",
  },
});
