import { Image, Text, View } from "react-native";

import { SvgUri } from "react-native-svg";

import { FaceitPlayer } from "@repo/types";
import Frame from "@/src/components/Frame";

export default function FaceitAccountPreviewCard({
  faceitPlayer,
}: {
  faceitPlayer: FaceitPlayer;
}) {
  const faceitLevel =
    faceitPlayer.games.cs2?.skill_level ??
    Object.values(faceitPlayer.games)[0]?.skill_level;
  const faceitElo =
    faceitPlayer.games.cs2?.faceit_elo ??
    Object.values(faceitPlayer.games)[0]?.faceit_elo;
  const steamNickname = faceitPlayer.steam_nickname?.trim();
  const region = faceitPlayer.games.cs2?.region?.toUpperCase() ?? "CS2";

  return (
    <Frame className="flex w-full flex-col items-start gap-4 px-4 py-4">
      <View className="bg-primary/10 border-primary/20 rounded-full border px-2.5 py-1">
        <Text className="text-primary font-mono-semibold text-xs uppercase">
          Faceit profile
        </Text>
      </View>

      <View className="flex w-full flex-row items-center justify-between gap-3">
        <View className="flex min-w-0 flex-1 flex-row items-center gap-3.5">
          <Image
            source={{ uri: faceitPlayer.avatar }}
            className="h-14 w-14 rounded-full"
          />
          <View className="flex min-w-0 flex-1 flex-col gap-1">
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
        </View>
        <View className="border-border bg-dark/40 min-w-20 items-end rounded-xl border px-3 py-2">
          <Text className="text-text-muted font-mono-medium text-[10px] uppercase">
            ELO
          </Text>
          <Text className="text-text font-sans-semibold text-base">
            {faceitElo ?? "-"}
          </Text>
        </View>
      </View>

      <View className="border-border/80 flex w-full flex-row gap-2 border-t pt-3">
        <View className="border-border bg-dark/40 flex-1 rounded-xl border px-3 py-2.5">
          <Text className="text-text-muted font-mono-medium text-[10px] uppercase">
            Level
          </Text>
          <Text className="text-text font-sans-semibold text-sm">
            {faceitLevel ?? "-"}
          </Text>
        </View>
        <View className="border-border bg-dark/40 flex-1 rounded-xl border px-3 py-2.5">
          <Text className="text-text-muted font-mono-medium text-[10px] uppercase">
            Region
          </Text>
          <Text
            className="text-text font-sans-semibold text-sm"
            numberOfLines={1}
          >
            {region}
          </Text>
        </View>
      </View>
    </Frame>
  );
}
