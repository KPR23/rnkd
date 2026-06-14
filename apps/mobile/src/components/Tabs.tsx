import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import {
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type GameAccount,
} from "@repo/types";
import getProfilePanelForGame from "@/src/components/GameProfileRegistry";

interface TabsProps {
  gameAccounts: GameAccount[];
}

function getTabLabel(gameId: string) {
  switch (gameId) {
    case GAMES.LOL:
      return "LOL";
    case GAMES.CS2_FACEIT:
      return "CS2";
    default:
      return gameId.replaceAll("_", " ").toUpperCase();
  }
}

function getTabDisplayLabel(accounts: GameAccount[], account: GameAccount) {
  const base = getTabLabel(account.gameId);
  const fallbackDetail = account.id.slice(0, 8);
  const sameGame = accounts.filter((a) => a.gameId === account.gameId);
  if (sameGame.length <= 1) {
    return base;
  }

  const detail = (() => {
    if (isLolGameAccount(account)) {
      return `${account.profile.gameName}#${account.profile.tagLine}`;
    }

    if (isCs2FaceitGameAccount(account)) {
      const faceitNickname = account.profile?.faceitNickname?.trim();
      const steamNickname = account.profile?.steamNickname?.trim();

      return faceitNickname || steamNickname || fallbackDetail;
    }

    return fallbackDetail;
  })();

  return `${base} · ${detail}`;
}

export default function Tabs({ gameAccounts }: TabsProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    gameAccounts[0]?.id ?? null,
  );

  useEffect(() => {
    if (gameAccounts.length === 0) {
      return;
    }
    setSelectedAccountId((prev) => {
      if (prev && gameAccounts.some((a) => a.id === prev)) {
        return prev;
      }
      return gameAccounts[0]!.id;
    });
  }, [gameAccounts]);

  const activeAccount = gameAccounts.find((a) => a.id === selectedAccountId);
  const Panel = activeAccount
    ? getProfilePanelForGame(activeAccount.gameId)
    : null;

  const useHorizontalScroll = gameAccounts.length > 3;

  const tabRow = (
    <View className="w-full flex-row">
      {gameAccounts.map((gameAccount, idx) => {
        const isActive = selectedAccountId === gameAccount.id;
        const isLast = idx === gameAccounts.length - 1;
        return (
          <TouchableOpacity
            key={gameAccount.id}
            activeOpacity={0.7}
            onPress={() => setSelectedAccountId(gameAccount.id)}
            className={[
              "relative h-9 items-center justify-center px-6",
              useHorizontalScroll ? "min-w-30" : "flex-1",
              !isLast ? "border-muted border-r" : "",
              isActive ? "bg-dark" : "",
            ].join(" ")}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={[
                "font-mono-semibold text-xs uppercase",
                isActive ? "text-white" : "text-text-secondary",
              ].join(" ")}
              numberOfLines={1}
            >
              {getTabDisplayLabel(gameAccounts, gameAccount)}
            </Text>

            {isActive && (
              <View className="bg-primary absolute right-0 bottom-0 left-0 h-0.75" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View className="mt-8 w-full">
      <View className="border-muted bg-background w-full overflow-hidden border">
        {useHorizontalScroll ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {tabRow}
          </ScrollView>
        ) : (
          tabRow
        )}
      </View>
      <View className="text-text border-muted w-full flex-col items-center justify-center gap-5 border-r border-b border-l">
        {activeAccount && Panel ? <Panel gameAccount={activeAccount} /> : null}
      </View>
    </View>
  );
}
