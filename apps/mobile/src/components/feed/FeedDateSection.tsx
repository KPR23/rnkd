import { View } from "react-native";

import AppText from "@/src/components/AppText";
import type { FeedDateSectionLabel } from "@/src/lib/feed/feed-time";

type Props = {
  label: FeedDateSectionLabel;
};

export function FeedDateHeading({ label }: Props) {
  return (
    <View className="flex-row items-end gap-1.5">
      <AppText className="text-base" weight="medium">
        {label.primary}
      </AppText>
      {label.secondary ? (
        <AppText className="pb-px text-sm" color="#828083">
          · {label.secondary}
        </AppText>
      ) : null}
    </View>
  );
}

export function FeedOlderPostsDivider() {
  return (
    <View className="flex-row items-center gap-2.5 py-1">
      <View className="bg-muted h-px flex-1" />
      <AppText className="text-sm" color="#828083" weight="medium">
        Older posts
      </AppText>
      <View className="bg-muted h-px flex-1" />
    </View>
  );
}
