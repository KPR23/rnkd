import { useState } from "react";
import { Alert, Modal, Text, View } from "react-native";

import {
  GameAccount,
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type GameId,
} from "@repo/types";
import Button from "@/src/components/Button";
import { trpc } from "@/src/utils/trpc";

const GAME_TITLE: Record<GameId, string> = {
  [GAMES.LOL]: "League of Legends",
  [GAMES.CS2_FACEIT]: "Counter-Strike 2",
};

function accountDisplayName(account: GameAccount): string {
  if (isLolGameAccount(account)) {
    const { gameName, tagLine } = account.profile;
    return `${gameName} #${tagLine}`;
  }
  if (isCs2FaceitGameAccount(account)) {
    return (
      account.profile?.faceitNickname?.trim() ||
      account.profile?.steamNickname?.trim() ||
      account.externalId
    );
  }
  throw new Error("Unexpected game account type");
}

export default function LinkedAccountCard({
  linkedAccount,
}: {
  linkedAccount: GameAccount;
}) {
  const utils = trpc.useUtils();
  const { mutateAsync: unlinkLolAccount } =
    trpc.gameAccount.unlinkLolAccount.useMutation({
      onSuccess: () => {
        utils.gameAccount.getGameAccounts.invalidate();
      },
    });
  const { mutateAsync: unlinkCS2FaceitAccount } =
    trpc.gameAccount.unlinkCS2FaceitAccount.useMutation({
      onSuccess: () => {
        utils.gameAccount.getGameAccounts.invalidate();
      },
    });

  const handleUnlink = (linkedAccount: GameAccount) => {
    Alert.alert(
      "Unlink account",
      "Are you sure you want to unlink this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            try {
              if (isLolGameAccount(linkedAccount)) {
                await unlinkLolAccount({ gameAccountId: linkedAccount.id });
              } else if (isCs2FaceitGameAccount(linkedAccount)) {
                await unlinkCS2FaceitAccount({
                  gameAccountId: linkedAccount.id,
                });
              }
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex h-16 w-full flex-row items-center">
      <View className="bg-card border-border h-full w-full flex-1 flex-col items-start justify-center gap-0.5 border px-4">
        <Text className="font-sans-medium text-text-secondary text-xs">
          {GAME_TITLE[linkedAccount.gameId]}
        </Text>
        <Text className="font-sans-semibold text-text text-sm">
          {accountDisplayName(linkedAccount)}
        </Text>
      </View>
      <Button
        variant="secondary"
        className="h-full border-l-0 px-4"
        actionText={linkedAccount.externalId && "Unlink"}
        onPress={() => {
          linkedAccount.externalId && handleUnlink(linkedAccount);
        }}
      />
    </View>
  );
}
