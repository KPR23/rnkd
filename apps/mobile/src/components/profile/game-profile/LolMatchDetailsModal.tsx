import { ActivityIndicator, Image, View } from "react-native";

import type { LolMatchDetailsPlayer, LolMatchDetailsTeam } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import CustomModal from "@/src/components/Modal";
import { getLolChampionSplashUrl } from "@/src/lib/helper/lolChampion";
import { formatMatchDetailsDateTime } from "@/src/lib/helper/matchDetailsTime";
import { trpc } from "@/src/utils/trpc";

function formatKda(player: Pick<LolMatchDetailsPlayer, "kills" | "deaths" | "assists">) {
  return `${player.kills}/${player.deaths}/${player.assists}`;
}

function formatKdaRatio(
  player: Pick<LolMatchDetailsPlayer, "kills" | "deaths" | "assists">,
) {
  const ratio =
    player.deaths > 0
      ? (player.kills + player.assists) / player.deaths
      : player.kills + player.assists;
  return `${ratio.toFixed(2)} KDA`;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function TeamSection({ team }: { team: LolMatchDetailsTeam }) {
  const scoreColor = team.won ? colors.success : colors.destructive;

  return (
    <View className="border-muted bg-card border pt-3">
      <View className="flex-row items-center px-4 pb-3">
        <AppText className="min-w-0 flex-1 text-[13px]" weight="medium">
          {team.name}
        </AppText>
        <AppText className="text-[13px] tabular-nums" color={scoreColor}>
          {team.score} kills
        </AppText>
      </View>
      <View className="bg-muted h-px w-full" />

      {team.players.length > 0 ? (
        team.players.map((player, index) => (
          <View key={player.id}>
            <View
              className={`flex-row items-center px-4 py-4 ${
                player.isViewer ? "bg-muted/40" : ""
              }`}
            >
              <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-3">
                <Image
                  source={{ uri: player.championIconUrl }}
                  className="h-9 w-9"
                  resizeMode="cover"
                />
                <View className="min-w-0 flex-1">
                  <AppText className="text-sm" weight="medium" numberOfLines={1}>
                    {player.isViewer ? `${player.riotId} (You)` : player.riotId}
                  </AppText>
                  <AppText
                    className="text-xs"
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {player.championName} · {player.teamPosition || "—"}
                  </AppText>
                </View>
              </View>
              <View className="items-end">
                <AppText className="text-[13px] tabular-nums">
                  {formatKdaRatio(player)}
                </AppText>
                <AppText
                  className="text-[13px] tabular-nums"
                  color={colors.textSecondary}
                >
                  {formatKda(player)} · {player.totalMinionsKilled ?? "—"} CS
                </AppText>
              </View>
            </View>
            {index < team.players.length - 1 ? (
              <View className="bg-muted h-px w-full" />
            ) : null}
          </View>
        ))
      ) : (
        <View className="px-4 py-4">
          <AppText color={colors.textSecondary}>
            No linked players stored for this team.
          </AppText>
        </View>
      )}
    </View>
  );
}

export default function LolMatchDetailsModal({
  visible,
  matchId,
  gameAccountId,
  onClose,
}: {
  visible: boolean;
  matchId: string | null;
  gameAccountId: string;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = trpc.match.getLolMatchDetails.useQuery(
    {
      matchId: matchId ?? "",
      gameAccountId,
    },
    {
      enabled: visible && !!matchId,
    },
  );

  const splashUrl = data
    ? getLolChampionSplashUrl(data.summary.viewerChampionIconUrl)
    : null;
  const playedAt = data
    ? data.summary.playedAt instanceof Date
      ? data.summary.playedAt
      : new Date(data.summary.playedAt)
    : null;
  const outcomeColor = data?.summary.viewerWon
    ? colors.success
    : colors.destructive;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      headerCenter={
        <AppText className="text-xl" weight="medium">
          Match details
        </AppText>
      }
    >
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError || !data ? (
        <View className="border-muted bg-card border px-4 py-6">
          <AppText color={colors.textSecondary}>
            Unable to load match details.
          </AppText>
        </View>
      ) : (
        <View className="flex flex-col gap-6">
          <View className="border-muted bg-card overflow-hidden border">
            <View className="bg-muted relative h-32 w-full overflow-hidden">
              {splashUrl ? (
                <Image
                  source={{ uri: splashUrl }}
                  className="h-32 w-full"
                  resizeMode="cover"
                />
              ) : null}
              <View className="bg-card/65 absolute inset-0" />
            </View>
            <View className="border-muted border-t px-3.5 py-3.5">
              <View className="flex-row items-center justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText className="text-base" weight="medium" numberOfLines={1}>
                    {data.summary.viewerChampionName}
                  </AppText>
                  <AppText className="text-[13px]" color={colors.textSecondary}>
                    {data.summary.queueLabel}
                  </AppText>
                </View>
                <AppText className="text-xl" weight="medium" color={outcomeColor}>
                  {data.summary.viewerWon ? "Victory" : "Defeat"}
                </AppText>
              </View>
              <View className="bg-muted my-3 h-px w-full" />
              <View className="flex-row items-center justify-between gap-3">
                <AppText className="text-[13px]" color={colors.textSecondary}>
                  {formatDuration(data.summary.durationSeconds)}
                </AppText>
                <AppText
                  className="text-right text-[13px] tabular-nums"
                  color={colors.textSecondary}
                >
                  {playedAt ? formatMatchDetailsDateTime(playedAt) : "—"}
                </AppText>
              </View>
            </View>
          </View>

          {data.teams.map((team) => (
            <TeamSection key={team.id} team={team} />
          ))}
        </View>
      )}
    </CustomModal>
  );
}
