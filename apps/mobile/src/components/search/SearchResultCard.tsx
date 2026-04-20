import { type ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { CaretRightIcon } from "phosphor-react-native";

import { GAMES, SEARCH_PROFILE_LABELS, type SearchResult } from "@repo/types";
import { colors, tagColors } from "@repo/ui/colors";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import GameLogo from "@/src/components/games/GameLogo";

interface SearchResultCardProps {
  result: SearchResult;
  onPress: () => void;
}

function SearchCardShell({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="bg-card border-border flex-row items-center justify-start gap-3 border px-4 py-3">
        {children}
        <View className="shrink-0 self-center">
          <CaretRightIcon weight="bold" color={colors.textMuted} size={16} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SearchResultLeading({ result }: { result: SearchResult }) {
  if (result.type === "game") {
    return (
      <View className="bg-dark size-11 items-center justify-center rounded-full">
        <GameLogo gameId={result.id} maxHeight={12} />
      </View>
    );
  }

  if (result.image) {
    return (
      <Image
        source={{ uri: result.image }}
        className="size-11 rounded-full"
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="bg-dark size-11 items-center justify-center rounded-full">
      <Text className="font-mono-medium text-text text-sm">
        {getInitialsForFallbackPhoto(result.name)}
      </Text>
    </View>
  );
}

function getGamePublisher(gameId: string) {
  switch (gameId) {
    case GAMES.LOL:
      return "Riot Games";
    case GAMES.CS2_FACEIT:
      return "Valve Software";
    default:
      return "";
  }
}

export default function SearchResultCard({
  result,
  onPress,
}: SearchResultCardProps) {
  if (result.type === "game") {
    return (
      <SearchCardShell onPress={onPress}>
        <SearchResultLeading result={result} />
        <View className="min-w-0 flex-1 items-start justify-center gap-0.5">
          <View className="w-full min-w-0 flex-row items-center justify-start gap-1">
            <Text
              className="font-sans-semibold text-text shrink text-sm leading-none"
              numberOfLines={1}
            >
              {result.name}
            </Text>
            <Text className="font-sans-semibold text-text-secondary text-sm leading-none">
              ·
            </Text>
            <Text
              className="font-sans-semibold text-xs leading-none"
              style={{ color: tagColors.game }}
            >
              {SEARCH_PROFILE_LABELS.game}
            </Text>
          </View>
          <Text
            className="font-sans-medium text-text-secondary min-w-0 shrink text-xs leading-none"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getGamePublisher(result.id)}
          </Text>
        </View>
      </SearchCardShell>
    );
  }

  const primaryLine = result.tag ? `@${result.tag}` : result.name;
  const secondaryLine = result.name;

  return (
    <SearchCardShell onPress={onPress}>
      <SearchResultLeading result={result} />
      <View className="min-w-0 flex-1 items-start justify-center gap-0.5">
        <View className="w-full min-w-0 flex-row items-center gap-1">
          <Text
            className="font-mono-semibold text-text shrink text-sm leading-none"
            numberOfLines={1}
          >
            {primaryLine}
          </Text>
          <Text className="font-sans-semibold text-text-secondary text-sm leading-none">
            ·
          </Text>
          <Text
            className="font-sans-semibold text-xs leading-none"
            style={{ color: tagColors[result.type] }}
          >
            {SEARCH_PROFILE_LABELS[result.type]}
          </Text>
        </View>
        <Text
          className="font-sans-medium text-text-secondary min-w-0 shrink text-xs leading-none"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {secondaryLine}
        </Text>
      </View>
    </SearchCardShell>
  );
}
