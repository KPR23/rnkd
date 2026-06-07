import { type ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { CaretRightIcon } from "phosphor-react-native";

import { GAMES, type SearchResult } from "@repo/types";
import { colors } from "@repo/ui/colors";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import GameLogo from "@/src/components/games/GameLogo";
import SearchResultCardContent from "@/src/components/search/SearchResultCardContent";

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
      <View className="bg-card border-muted flex-row items-center justify-start gap-3 border px-4 py-3">
        {children}
        <View className="shrink-0 self-center">
          <CaretRightIcon weight="regular" color={colors.textMuted} size={24} />
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
  const primaryLine =
    result.type === "game"
      ? result.name
      : result.tag
        ? result.tag
        : result.name;
  const secondaryLine =
    result.type === "game" ? getGamePublisher(result.id) : result.name;

  return (
    <SearchCardShell onPress={onPress}>
      <SearchResultLeading result={result} />
      <SearchResultCardContent
        primaryLine={primaryLine}
        profileType={result.type}
        secondaryLine={secondaryLine}
      />
    </SearchCardShell>
  );
}
