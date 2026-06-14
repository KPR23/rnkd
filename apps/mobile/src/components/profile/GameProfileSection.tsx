import { useState } from "react";
import { View } from "react-native";

import { GameControllerIcon } from "phosphor-react-native";

import {
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type Cs2FaceitMatchHistoryRow,
  type GameAccount,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import FaceitLevelProgressCard from "@/src/components/profile/FaceitLevelProgressCard";
import MatchDetailsModal from "@/src/components/profile/game-profile/MatchDetailsModal";
import ProfileRecentMatchCard from "@/src/components/profile/ProfileRecentMatchCard";
import { trpc } from "@/src/utils/trpc";

function gameTitle(gameId: string) {
  switch (gameId) {
    case GAMES.CS2_FACEIT:
      return "Counter-Strike 2";
    case GAMES.LOL:
      return "League of Legends";
    default:
      return "Game";
  }
}

export default function GameProfileSection({
  gameAccount,
  onOpenDetails,
}: {
  gameAccount: GameAccount;
  onOpenDetails: () => void;
}) {
  const isFaceit = isCs2FaceitGameAccount(gameAccount);
  const isLol = isLolGameAccount(gameAccount);

  const faceitDisplay = trpc.gameAccount.getCs2FaceitProfileDisplay.useQuery(
    { gameAccountId: gameAccount.id },
    { enabled: isFaceit },
  );

  const faceitMatches = trpc.match.getHistory.useQuery(
    { gameAccountId: gameAccount.id, limit: 2 },
    { enabled: isFaceit },
  );

  let nickname = gameAccount.externalId;
  if (isFaceit && gameAccount.profile?.faceitNickname?.trim()) {
    nickname = gameAccount.profile.faceitNickname.trim();
  } else if (isLol && gameAccount.profile?.gameName && gameAccount.profile?.tagLine) {
    nickname = `${gameAccount.profile.gameName}#${gameAccount.profile.tagLine}`;
  }

  const recentFaceitRows = (faceitMatches.data?.rows ??
    []) as Cs2FaceitMatchHistoryRow[];
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  return (
    <>
    <View className="flex flex-col gap-2">
      <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
        {gameTitle(gameAccount.gameId)}
      </AppText>

      <View className="flex flex-col gap-2.5">
        {isFaceit && faceitDisplay.data?.levelProgress ? (
          <FaceitLevelProgressCard
            nickname={nickname}
            levelProgress={faceitDisplay.data.levelProgress}
          />
        ) : null}

        {isFaceit && recentFaceitRows.length > 0 ? (
          <View className="flex flex-row gap-2.5">
            {recentFaceitRows.map((row) => (
              <ProfileRecentMatchCard
                key={row.matches.id}
                row={row}
                onPress={() => setSelectedMatchId(row.matches.id)}
              />
            ))}
          </View>
        ) : null}

        <Button
          variant="secondary"
          actionText="Game profile"
          className="w-full"
          icon={
            <GameControllerIcon
              size={20}
              color={colors.textSecondary}
              weight="regular"
            />
          }
          onPress={onOpenDetails}
        />
      </View>
    </View>

    {isFaceit ? (
      <MatchDetailsModal
        visible={!!selectedMatchId}
        matchId={selectedMatchId}
        gameAccountId={gameAccount.id}
        onClose={() => setSelectedMatchId(null)}
      />
    ) : null}
    </>
  );
}
