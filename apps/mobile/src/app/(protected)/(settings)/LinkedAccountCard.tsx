import { Alert, Pressable, Text, View } from "react-native";

import { CheckIcon } from "phosphor-react-native";

import {
  GameAccount,
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type GameId,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import { useMessage } from "@/src/lib/messages/message-provider";
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
  const { showError } = useMessage();
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
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not unlink account.";
              showError(message);
            }
          },
        },
      ],
    );
  };

  const linkedName = accountDisplayName(linkedAccount);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${GAME_TITLE[linkedAccount.gameId]}, linked to ${linkedName}. Long press to unlink.`}
      className="bg-card border-muted flex w-full flex-col border px-4"
      onLongPress={() => {
        if (linkedAccount.externalId) {
          handleUnlink(linkedAccount);
        }
      }}
    >
      <View className="flex h-16 flex-row items-center justify-between">
        <Text className="font-sans-medium text-text text-sm">
          {GAME_TITLE[linkedAccount.gameId]}
        </Text>
        <CheckIcon color={colors.primary} size={24} weight="bold" />
      </View>
      <View className="border-muted border-t py-3">
        <Text className="font-sans text-text-secondary text-sm">
          Linked to {linkedName}
        </Text>
      </View>
    </Pressable>
  );
}
