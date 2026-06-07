import { TouchableOpacity, View } from "react-native";

import { MagnifyingGlassIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

interface SearchRecentPreviewProps {
  recentSearches: string[];
  onSelectSearch: (value: string) => void;
  onViewAllPress?: () => void;
}

export default function SearchRecentPreview({
  recentSearches,
  onSelectSearch,
  onViewAllPress,
}: SearchRecentPreviewProps) {
  const previewSearch = recentSearches[0];

  if (!previewSearch) {
    return null;
  }

  return (
    <View className="flex w-full flex-col gap-1.5">
      <View className="flex-row items-center justify-between">
        <AppText
          className="text-sm leading-5"
          weight="medium"
          color={colors.textSecondary}
        >
          Recent searches
        </AppText>
        {onViewAllPress ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onViewAllPress}>
            <AppText
              className="text-sm leading-5"
              weight="medium"
              color={colors.primary}
            >
              View all
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-card border-muted flex-row items-center justify-between border px-4 py-3"
        onPress={() => onSelectSearch(previewSearch)}
      >
        <AppText
          className="text-sm leading-5"
          weight="medium"
          color={colors.text}
        >
          {previewSearch}
        </AppText>
        <MagnifyingGlassIcon size={19} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
