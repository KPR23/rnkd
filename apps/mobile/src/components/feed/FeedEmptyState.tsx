import { View } from "react-native";

import AppText from "@/src/components/AppText";

type Props = {
  title: string;
  description: string;
};

export default function FeedEmptyState({ title, description }: Props) {
  return (
    <View className="border-muted bg-card border px-4 py-8">
      <AppText className="mb-2 text-center text-base" weight="medium">
        {title}
      </AppText>
      <AppText className="text-center text-sm" color="#828083">
        {description}
      </AppText>
    </View>
  );
}
