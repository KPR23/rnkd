import { Image, View } from "react-native";

import type { Cs2FaceitGameAccount } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FaceitLevelBadge from "@/src/components/faceit/FaceitLevelBadge";

export default function GameProfileHeaderCard({
  gameAccount,
  skillLevel,
}: {
  gameAccount: Cs2FaceitGameAccount;
  skillLevel: number | null;
}) {
  const faceitNick =
    gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
  const steamNick = gameAccount.profile?.steamNickname?.trim();
  const avatarUri = gameAccount.profile?.avatar?.trim();

  return (
    <View className="border-muted bg-card flex-row items-center border py-4 pl-5">
      <View className="min-w-0 flex-1 flex-row items-center gap-4">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="h-14 w-14 rounded-full"
          />
        ) : (
          <View className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
            <AppText className="text-[11px] uppercase" weight="medium">
              {faceitNick.slice(0, 2)}
            </AppText>
          </View>
        )}
        <View className="min-w-0 flex-1 flex-col justify-center">
          <AppText className="text-xl" weight="medium" numberOfLines={1}>
            {faceitNick}
          </AppText>
          {steamNick ? (
            <AppText
              className="text-sm"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {steamNick}
            </AppText>
          ) : null}
        </View>
      </View>
      <View className="bg-muted h-14 w-px" />
      <View className="items-center justify-center px-[18px]">
        <FaceitLevelBadge level={skillLevel} size={40} />
      </View>
    </View>
  );
}
