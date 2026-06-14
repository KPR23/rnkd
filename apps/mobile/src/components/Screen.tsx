import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { BOTTOM_DOCK_HEIGHT } from "@/src/constants/bottom-dock";
import { DismissKeyboard } from "@/src/lib/keyboard/dismiss-keyboard";
import { useKeyboardOffset } from "@/src/lib/keyboard/keyboard-offset-provider";

const defaultSafeAreaEdges: Edge[] = ["top"];

export type ScreenProps = PropsWithChildren<{
  safeAreaEdges?: Edge[];
  footer?: ReactNode;
}>;

export default function Screen({
  children,
  safeAreaEdges = defaultSafeAreaEdges,
  footer,
}: ScreenProps) {
  const keyboardOffset = useKeyboardOffset();

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={safeAreaEdges}>
        <DismissKeyboard className="flex-1 px-5">{children}</DismissKeyboard>
        {footer ? (
          <View
            className="border-muted border-t px-5"
            style={{
              height: BOTTOM_DOCK_HEIGHT,
              marginBottom: keyboardOffset,
            }}
          >
            {footer}
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
