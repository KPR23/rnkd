import { type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { useRouter } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

const BACK_HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 } as const;

export type HeaderProps = {
  title: string;
  description?: string;
  variant?: "centered" | "leading";
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
  className?: string;
};

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={BACK_HIT_SLOP}
      onPress={onPress}
      className="size-6 items-center justify-center"
    >
      <CaretLeftIcon size={24} color={colors.text} />
    </Pressable>
  );
}

function HeaderSideSlot({ children }: { children?: ReactNode }) {
  return (
    <View className="size-6 shrink-0 items-center justify-center">
      {children}
    </View>
  );
}

export function HeaderDescription({
  description,
  className = "",
}: {
  description: string;
  className?: string;
}) {
  return (
    <AppText
      className={`text-base leading-5 ${className}`}
      color={colors.textSecondary}
    >
      {description}
    </AppText>
  );
}

export function HeaderBar({
  title,
  variant = "centered",
  showBack = true,
  onBack,
  rightSlot,
  className = "",
}: Omit<HeaderProps, "description">) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  if (variant === "centered") {
    return (
      <View className={`min-h-6 flex-row items-center ${className}`}>
        <HeaderSideSlot>
          {showBack ? <BackButton onPress={handleBack} /> : null}
        </HeaderSideSlot>
        <View className="min-w-0 flex-1 justify-center px-1">
          <AppText
            className="text-center text-xl leading-6"
            numberOfLines={1}
            weight="medium"
          >
            {title}
          </AppText>
        </View>
        <HeaderSideSlot>{rightSlot}</HeaderSideSlot>
      </View>
    );
  }

  return (
    <View className={`min-h-6 flex-row items-center gap-3 ${className}`}>
      {showBack ? <BackButton onPress={handleBack} /> : null}
      <View className="min-w-0 flex-1 justify-center">
        <AppText
          className="text-xl leading-6"
          numberOfLines={1}
          weight="medium"
        >
          {title}
        </AppText>
      </View>
      {rightSlot ? (
        <View className="shrink-0 flex-row items-center gap-2.5">
          {rightSlot}
        </View>
      ) : null}
    </View>
  );
}

export default function Header({
  title,
  description,
  variant = "centered",
  showBack = true,
  onBack,
  rightSlot,
  className = "",
}: HeaderProps) {
  return (
    <View className={`gap-4 ${className}`}>
      <HeaderBar
        title={title}
        variant={variant}
        showBack={showBack}
        onBack={onBack}
        rightSlot={rightSlot}
      />
      {description ? <HeaderDescription description={description} /> : null}
    </View>
  );
}
