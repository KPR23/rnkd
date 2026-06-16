import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type Cs2FaceitMatchHistoryRow,
  type LolMatchHistoryRow,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import ProfileGameStatCard from "@/src/components/ProfileGameStatCard";
import GameProfileOverviewTab from "@/src/components/profile/game-profile/GameProfileOverviewTab";
import GameProfileStatsTab from "@/src/components/profile/game-profile/GameProfileStatsTab";
import GameProfileTabBar from "@/src/components/profile/game-profile/GameProfileTabBar";
import LolGameProfileOverviewTab from "@/src/components/profile/game-profile/LolGameProfileOverviewTab";
import { useStickyHeaderScrollHandler } from "@/src/components/StickyHeaderShell";
import { trpc } from "@/src/utils/trpc";

const MATCH_HISTORY_PAGE_SIZE = 20;
const MATCH_HISTORY_LOAD_THRESHOLD = 240;
type MatchHistoryRow = Cs2FaceitMatchHistoryRow | LolMatchHistoryRow;

export default function GameProfileScreen({
  gameAccountId,
}: {
  gameAccountId: string;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "stats">("overview");
  const fetchNextPageInFlight = useRef(false);
  const onStickyHeaderScroll = useStickyHeaderScrollHandler();

  const {
    data: matchHistoryPages,
    isLoading: isMatchHistoryLoading,
    isError: isMatchHistoryError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.match.getHistoryPage.useInfiniteQuery(
    {
      gameAccountId,
      limit: MATCH_HISTORY_PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const gameId = matchHistoryPages?.pages[0]?.gameId;

  const {
    data: cs2Display,
    isLoading: isCs2DisplayLoading,
    isError: isCs2DisplayError,
  } = trpc.gameAccount.getCs2FaceitProfileDisplay.useQuery(
    {
      gameAccountId,
    },
    { enabled: gameId === GAMES.CS2_FACEIT },
  );

  const {
    data: lolDisplay,
    isLoading: isLolDisplayLoading,
    isError: isLolDisplayError,
  } = trpc.gameAccount.getLolProfileDisplay.useQuery(
    {
      gameAccountId,
    },
    { enabled: gameId === GAMES.LOL },
  );

  const matchHistory = useMemo<MatchHistoryRow[]>(() => {
    const rows: MatchHistoryRow[] = [];

    for (const page of matchHistoryPages?.pages ?? []) {
      rows.push(...(page.rows as MatchHistoryRow[]));
    }

    return rows;
  }, [matchHistoryPages]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onStickyHeaderScroll?.(event);

      if (
        activeTab !== "overview" ||
        !hasNextPage ||
        isFetchingNextPage ||
        fetchNextPageInFlight.current
      ) {
        return;
      }

      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom <= MATCH_HISTORY_LOAD_THRESHOLD) {
        fetchNextPageInFlight.current = true;
        void fetchNextPage()
          .finally(() => {
            fetchNextPageInFlight.current = false;
          });
      }
    },
    [
      activeTab,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      onStickyHeaderScroll,
    ],
  );

  if (isMatchHistoryLoading || !gameId) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isCurrentDisplayLoading =
    gameId === GAMES.CS2_FACEIT ? isCs2DisplayLoading : isLolDisplayLoading;
  const isCurrentDisplayError =
    gameId === GAMES.CS2_FACEIT ? isCs2DisplayError : isLolDisplayError;
  const display = gameId === GAMES.CS2_FACEIT ? cs2Display : lolDisplay;

  if (isCurrentDisplayLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isMatchHistoryError || isCurrentDisplayError || !display?.gameAccount) {
    return (
      <Text className="text-text mt-4 text-center font-sans">
        Game profile not found.
      </Text>
    );
  }

  const gameAccount = display.gameAccount;

  if (gameAccount.gameId === GAMES.CS2_FACEIT && isCs2FaceitGameAccount(gameAccount)) {
    const cs2MatchHistory = matchHistory as Cs2FaceitMatchHistoryRow[];

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 32, gap: 20 }}
      >
        <GameProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" ? (
          <GameProfileOverviewTab
            gameAccount={gameAccount}
            display={cs2Display}
            matchHistory={cs2MatchHistory}
            isDisplayLoading={isCs2DisplayLoading}
            isMatchHistoryLoading={isMatchHistoryLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
          />
        ) : (
          <GameProfileStatsTab
            gameAccount={gameAccount}
            display={cs2Display}
            matchHistory={cs2MatchHistory}
            isMatchHistoryLoading={isMatchHistoryLoading}
          />
        )}
      </ScrollView>
    );
  }

  if (gameAccount.gameId === GAMES.LOL && isLolGameAccount(gameAccount)) {
    const lolMatchHistory = matchHistory as LolMatchHistoryRow[];

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 32, gap: 20 }}
      >
        <GameProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" ? (
          <LolGameProfileOverviewTab
            gameAccount={gameAccount}
            display={lolDisplay}
            matchHistory={lolMatchHistory}
            isDisplayLoading={isLolDisplayLoading}
            isMatchHistoryLoading={isMatchHistoryLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
          />
        ) : (
          <ProfileGameStatCard gameAccount={gameAccount} />
        )}
      </ScrollView>
    );
  }

  return (
    <Text className="text-text mt-4 text-center font-sans">
      This game profile is not available yet.
    </Text>
  );
}
