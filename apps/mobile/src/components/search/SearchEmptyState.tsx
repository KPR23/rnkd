import { View } from "react-native";

import { MagnifyingGlassIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

const PARAGRAPH_COLOR = "#8d8d8d";

interface SearchEmptyStateProps {
  title: string;
  subtitle?: string;
}

export default function SearchEmptyState({
  title,
  subtitle,
}: SearchEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center gap-4">
        <MagnifyingGlassIcon size={48} color={colors.text} />
        <View className="items-center gap-1.5">
          <AppText
            className="text-center text-lg"
            weight="medium"
            color={colors.text}
          >
            {title}
          </AppText>
          {subtitle ? (
            <AppText
              className="text-center text-base leading-5"
              color={PARAGRAPH_COLOR}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}
