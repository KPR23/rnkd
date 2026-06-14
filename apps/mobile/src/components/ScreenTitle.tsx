import React from "react";
import { Pressable, View } from "react-native";

import { useRouter } from "expo-router";
import { BellSimpleIcon, GearSixIcon } from "phosphor-react-native";

import AppText from "@/src/components/AppText";
import RSBadge from "@/src/components/RSBadge";

type Props = {
  title: string;
  showRsBadge?: boolean;
  showSettings?: boolean;
  isBackNavigation?: boolean;
  globalRs?: number;
};

export default function ScreenTitle({
  title,
  showRsBadge = false,
  showSettings = false,
  isBackNavigation = false,
  globalRs = 0,
}: Props) {
  const router = useRouter();
  const canShowBadge = showRsBadge && !isBackNavigation;
  const canShowSettings = showSettings && !isBackNavigation;

  return (
    <View className="my-4 flex-row items-center">
      <AppText
        className="text-text font-sans-medium text-3xl leading-[32px]"
        weight="medium"
      >
        {title}
      </AppText>
      <View className="w-6" />
      <View className="flex-1" />
      <View className="flex-row items-center gap-3">
        {canShowBadge ? <RSBadge globalRs={globalRs} /> : null}
        <BellSimpleIcon size={24} color="white" />
        {canShowSettings ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => router.push("/settings")}
          >
            <GearSixIcon size={24} color="white" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
