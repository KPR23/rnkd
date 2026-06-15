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
  type Cs2FaceitMatchHistoryRow,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import GameProfileOverviewTab from "@/src/components/profile/game-profile/GameProfileOverviewTab";
import GameProfileStatsTab from "@/src/components/profile/game-profile/GameProfileStatsTab";
import GameProfileTabBar from "@/src/components/profile/game-profile/GameProfileTabBar";
import { useStickyHeaderScrollHandler } from "@/src/components/StickyHeaderShell";
import { trpc } from "@/src/utils/trpc";

const MATCH_HISTORY_PAGE_SIZE = 20;
const MATCH_HISTORY_LOAD_THRESHOLD = 240;

export default function GameProfileScreen({
  gameAccountId,
}: {
  gameAccountId: string;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "stats">("overview");
  const fetchNextPageInFlight = useRef(false);
  const onStickyHeaderScroll = useStickyHeaderScrollHandler();

  const {
    data: display,
    isLoading: isDisplayLoading,
    isError,
  } = trpc.gameAccount.getCs2FaceitProfileDisplay.useQuery({
    gameAccountId,
  });

  const {
    data: matchHistoryPages,
    isLoading: isMatchHistoryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.gameAccount.getCs2FaceitMatchHistoryPage.useInfiniteQuery(
    {
      gameAccountId,
      limit: MATCH_HISTORY_PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const matchHistory = useMemo(
    () =>
      matchHistoryPages?.pages.flatMap((page) => page.rows) ??
      ([] as Cs2FaceitMatchHistoryRow[]),
    [matchHistoryPages],
  );

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
        console.log("[match-history] near bottom", {
          activeTab,
          distanceFromBottom,
          hasNextPage,
          isFetchingNextPage,
          pages: matchHistoryPages?.pages.length ?? 0,
          rows: matchHistory.length,
        });
      }

      if (distanceFromBottom <= MATCH_HISTORY_LOAD_THRESHOLD) {
        fetchNextPageInFlight.current = true;
        console.log("[match-history] fetching next page");
        void fetchNextPage()
          .then((result) => {
            console.log("[match-history] fetch next page result", {
              pages: result.data?.pages.length ?? 0,
              rows:
                result.data?.pages.reduce(
                  (count, page) => count + page.rows.length,
                  0,
                ) ?? 0,
              error: result.error?.message,
            });
          })
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
      matchHistory.length,
      matchHistoryPages?.pages.length,
      onStickyHeaderScroll,
    ],
  );

  if (isDisplayLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !display?.gameAccount) {
    return (
      <Text className="text-text mt-4 text-center font-sans">
        Game profile not found.
      </Text>
    );
  }

  const gameAccount = display.gameAccount;

  if (
    gameAccount.gameId !== GAMES.CS2_FACEIT ||
    !isCs2FaceitGameAccount(gameAccount)
  ) {
    return (
      <Text className="text-text mt-4 text-center font-sans">
        This game profile is not available yet.
      </Text>
    );
  }

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
          display={display}
          matchHistory={matchHistory}
          isDisplayLoading={isDisplayLoading}
          isMatchHistoryLoading={isMatchHistoryLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      ) : (
        <GameProfileStatsTab
          gameAccount={gameAccount}
          display={display}
          matchHistory={matchHistory}
          isMatchHistoryLoading={isMatchHistoryLoading}
        />
      )}
    </ScrollView>
  );
}
