import { Image, Text, View } from "react-native";

import { SvgUri } from "react-native-svg";

import { FaceitPlayer } from "@repo/types";
import FaceitLevelBadge from "@/src/components/faceit/FaceitLevelBadge";
import Frame from "@/src/components/Frame";

export default function FaceitAccountPreviewCard({
  faceitPlayer,
}: {
  faceitPlayer: FaceitPlayer;
}) {
  const faceitLevel =
    faceitPlayer.games.cs2?.skill_level ??
    Object.values(faceitPlayer.games)[0]?.skill_level;
  const steamNickname = faceitPlayer.steam_nickname?.trim();

  return (
    <Frame className="flex w-full flex-col items-start gap-4 p-4">
      <View className="flex w-full flex-row items-center justify-between gap-3">
        <Image
          source={{ uri: faceitPlayer.avatar }}
          className="h-12 w-12 rounded-full"
        />
        <View className="flex min-w-0 flex-1 flex-col">
          <View className="flex flex-row items-center gap-2">
            <Text
              className="text-text font-sans-semibold text-lg"
              numberOfLines={1}
            >
              {faceitPlayer.nickname}
            </Text>
            <SvgUri
              width={16}
              height={12}
              uri={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${faceitPlayer.country.toLowerCase()}.svg`}
            />
          </View>
          {steamNickname ? (
            <Text
              className="text-text-secondary font-sans-medium text-sm"
              numberOfLines={1}
            >
              {steamNickname}
            </Text>
          ) : (
            <Text className="text-text-muted font-sans-medium text-sm">
              Steam profile not available
            </Text>
          )}
        </View>
        <View className="flex shrink-0 flex-row items-center gap-2">
          <FaceitLevelBadge level={faceitLevel} size={40} />
        </View>
      </View>
    </Frame>
  );
}
