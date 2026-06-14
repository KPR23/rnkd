import { Pressable } from "react-native";

import { useRouter } from "expo-router";
import { BellSimpleIcon, GearSixIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import { HeaderBar } from "@/src/components/Header";
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

  const rightSlot = (
    <>
      {canShowBadge ? <RSBadge globalRs={globalRs} /> : null}
      <BellSimpleIcon size={24} color={colors.text} />
      {canShowSettings ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push("/settings")}
        >
          <GearSixIcon size={24} color={colors.text} />
        </Pressable>
      ) : null}
    </>
  );

  return (
    <HeaderBar
      variant="leading"
      showBack={false}
      title={title}
      rightSlot={rightSlot}
      className="mb-2"
    />
  );
}
