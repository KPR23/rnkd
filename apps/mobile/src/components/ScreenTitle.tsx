import React from "react";
import { Pressable, View } from "react-native";

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
  const canShowBadge = showRsBadge && !isBackNavigation;
  const canShowSettings = showSettings && !isBackNavigation;

  return (
    <View className="my-4 flex-row items-center justify-between">
      <AppText className="text-text font-sans-medium text-3xl" weight="medium">
        {title}
      </AppText>
      <View className="flex-row items-center gap-3">
        {canShowBadge ? <RSBadge globalRs={globalRs} /> : null}
        <Pressable>
          <BellSimpleIcon size={24} color="white" />
        </Pressable>
        {canShowSettings ? (
          <Pressable>
            <GearSixIcon size={24} color="white" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
