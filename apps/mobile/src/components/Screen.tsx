import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { resolveBottomDockHeight } from "@/src/constants/bottom-dock";
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
  const footerHeight = resolveBottomDockHeight(keyboardOffset);

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={safeAreaEdges}>
        <View className="flex-1 px-5">{children}</View>
        {footer ? (
          <View
            className="border-muted border-t px-5"
            style={{
              height: footerHeight,
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
