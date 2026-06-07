import { View } from "react-native";

import type { Cs2FaceitMatchDetailsTeam } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import MatchDetailsPlayerRow from "@/src/components/profile/game-profile/MatchDetailsPlayerRow";
import {
  MATCH_DETAILS_KD_WIDTH,
  MATCH_DETAILS_KDA_WIDTH,
  MATCH_DETAILS_STAT_GAP,
} from "@/src/components/profile/game-profile/matchDetailsTableLayout";

function StatColumnsHeader() {
  return (
    <View
      className="shrink-0 flex-row items-center"
      style={{ gap: MATCH_DETAILS_STAT_GAP }}
    >
      <AppText
        className="text-[13px]"
        color={colors.textSecondary}
        numberOfLines={1}
        style={{ width: MATCH_DETAILS_KD_WIDTH, textAlign: "right" }}
      >
        K/D
      </AppText>
      <AppText
        className="text-[13px]"
        color={colors.textSecondary}
        numberOfLines={1}
        style={{ width: MATCH_DETAILS_KDA_WIDTH, textAlign: "right" }}
      >
        K/D/A
      </AppText>
    </View>
  );
}

export default function MatchDetailsTeamSection({
  team,
}: {
  team: Cs2FaceitMatchDetailsTeam;
}) {
  return (
    <View className="border-muted bg-card border pt-3">
      <View className="flex-row items-center px-4 pb-3">
        <AppText
          className="min-w-0 flex-1 text-[13px]"
          weight="medium"
          numberOfLines={2}
        >
          {team.name}
        </AppText>
        <StatColumnsHeader />
      </View>
      <View className="bg-muted h-px w-full" />

      <View>
        {team.players.map((player, index) => (
          <View key={player.playerId}>
            <MatchDetailsPlayerRow player={player} />
            {index < team.players.length - 1 ? (
              <View className="bg-muted h-px w-full" />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
