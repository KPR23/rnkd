import { Image, Text, TouchableOpacity, View } from "react-native";

import { SvgUri } from "react-native-svg";

import { FaceitPlayer } from "@repo/types";
import Frame from "@/src/components/Frame";

export default function FaceitAccountPreviewCard({
  faceitPlayer,
  onWrongAccountPress,
  isDisabled = false,
}: {
  faceitPlayer: FaceitPlayer;
  onWrongAccountPress: () => void;
  isDisabled?: boolean;
}) {
  const faceitLevel =
    faceitPlayer.games.cs2?.skill_level ??
    Object.values(faceitPlayer.games)[0]?.skill_level;
  const faceitElo =
    faceitPlayer.games.cs2?.faceit_elo ??
    Object.values(faceitPlayer.games)[0]?.faceit_elo;

  return (
    <Frame className="flex flex-col gap-4">
      <View className="flex flex-row items-center justify-between gap-3">
        <View className="flex min-w-0 flex-1 flex-row items-center gap-3">
          <Image
            source={{ uri: faceitPlayer.avatar }}
            className="h-10 w-10 rounded-full"
          />
          <View className="flex min-w-0 flex-1 flex-col">
            <View className="flex flex-row items-center gap-1.5">
              <Text
                className="text-text font-sans-semibold text-base"
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
            <Text
              className="text-text-secondary font-sans-medium text-sm"
              numberOfLines={1}
            >
              {faceitPlayer.steam_nickname}
            </Text>
          </View>
        </View>
        <View className="items-end gap-1">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-text font-sans-semibold text-sm">
              {faceitElo ?? "-"} ELO
            </Text>
          </View>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-text font-sans-medium text-sm">
          Is this your account?
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onWrongAccountPress}
          disabled={isDisabled}
          className="self-start"
        >
          <Text
            className={`font-sans-medium text-sm ${
              isDisabled ? "text-text-muted" : "text-primary"
            }`}
          >
            This isn't my account
          </Text>
        </TouchableOpacity>
      </View>
    </Frame>
  );
}
