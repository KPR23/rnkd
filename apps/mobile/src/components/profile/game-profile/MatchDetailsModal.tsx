import { ActivityIndicator, View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import CustomModal from "@/src/components/Modal";
import MatchDetailsSummaryCard from "@/src/components/profile/game-profile/MatchDetailsSummaryCard";
import MatchDetailsTeamSection from "@/src/components/profile/game-profile/MatchDetailsTeamSection";
import { trpc } from "@/src/utils/trpc";

export default function MatchDetailsModal({
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
  const { data, isLoading, isError } =
    trpc.match.getCs2FaceitMatchDetails.useQuery(
      {
        matchId: matchId ?? "",
        gameAccountId,
      },
      {
        enabled: visible && !!matchId,
      },
    );

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
          <MatchDetailsSummaryCard details={data} />
          {data.teams.map((team, index) => (
            <MatchDetailsTeamSection
              key={`${team.name}-${index}`}
              team={team}
            />
          ))}
        </View>
      )}
    </CustomModal>
  );
}
