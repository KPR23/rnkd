import { useEffect, useMemo, useState } from "react";
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
    Object.values(faceitPlayer.games)[0]?.skill_level ??
    0;
  const steamNickname = faceitPlayer.steam_nickname?.trim();
  const countryCode = useMemo(() => {
    const code = faceitPlayer.country?.trim().toLowerCase();
    return code && /^[a-z]{2}$/.test(code) ? code : null;
  }, [faceitPlayer.country]);
  const [flagFailed, setFlagFailed] = useState(false);

  useEffect(() => {
    setFlagFailed(false);
  }, [countryCode]);

  return (
    <Frame className="flex w-full flex-col items-start gap-4 p-4">
      <View className="flex w-full flex-row items-center justify-between gap-3">
        <Image
          source={{ uri: faceitPlayer.avatar }}
          accessibilityLabel={`Avatar of ${faceitPlayer.nickname || faceitPlayer.player_id || "player"}`}
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
            {countryCode && !flagFailed ? (
              <SvgUri
                width={16}
                height={12}
                uri={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${countryCode}.svg`}
                onError={() => setFlagFailed(true)}
                accessibilityLabel={`${countryCode.toUpperCase()} flag`}
                accessibilityRole="image"
              />
            ) : (
              <Text className="text-text-muted font-sans-semibold text-xs uppercase">
                --
              </Text>
            )}
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
