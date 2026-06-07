import { View } from "react-native";

import { SEARCH_PROFILE_LABELS, type SearchResult } from "@repo/types";
import { colors, tagColors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

export default function SearchResultCardContent({
  primaryLine,
  profileType,
  secondaryLine,
}: {
  primaryLine: string;
  profileType: SearchResult["type"];
  secondaryLine: string;
}) {
  return (
    <View className="min-w-0 flex-1 items-start justify-center">
      <View className="w-full min-w-0 flex-row items-center gap-1">
        <AppText
          weight="medium"
          className="shrink text-base leading-none"
          numberOfLines={1}
        >
          {primaryLine}
        </AppText>
        <AppText
          className="text-base leading-none"
          color={colors.textSecondary}
        >
          ·
        </AppText>
        <AppText
          className="text-sm leading-none"
          style={{ color: tagColors[profileType] }}
        >
          {SEARCH_PROFILE_LABELS[profileType]}
        </AppText>
      </View>
      <AppText
        className="min-w-0 shrink text-sm leading-none"
        color={colors.textSecondary}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {secondaryLine}
      </AppText>
    </View>
  );
}
