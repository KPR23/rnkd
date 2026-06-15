import { View } from "react-native";

import { GameControllerIcon } from "phosphor-react-native";

import type { GameAccount } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

function getAccountLabel(account: GameAccount) {
  return account.gameId === "lol"
    ? "League of Legends"
    : "Counter-Strike 2 FACEIT";
}

export default function OnboardingAccountsStep({
  linkedAccounts,
}: {
  linkedAccounts: GameAccount[];
}) {
  return (
    <View className="gap-5">
      <View className="border-muted bg-card gap-3 border p-4">
        <View className="flex-row items-center gap-3">
          <View className="bg-primary/15 size-10 items-center justify-center">
            <GameControllerIcon
              size={21}
              color={colors.primary}
              weight="bold"
            />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <AppText className="text-base" weight="medium">
              Link your game accounts
            </AppText>
            <AppText className="text-sm leading-5" color={colors.textSecondary}>
              RNKD can track League of Legends and CS2 FACEIT stats.
            </AppText>
          </View>
        </View>
      </View>

      {linkedAccounts.length > 0 ? (
        <View className="gap-2">
          {linkedAccounts.map((account) => (
            <View
              key={account.id}
              className="border-muted bg-card border px-4 py-3"
            >
              <AppText className="text-sm" weight="medium">
                {getAccountLabel(account)}
              </AppText>
              <AppText className="text-xs" color={colors.textSecondary}>
                Connected and ready to sync.
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <View className="border-muted bg-card border px-4 py-5">
          <AppText className="text-sm leading-5" color={colors.textSecondary}>
            You can add one now or skip and connect it later from Profile
            settings.
          </AppText>
        </View>
      )}
    </View>
  );
}
