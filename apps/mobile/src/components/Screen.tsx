import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

import { SafeAreaView, type Edge } from "react-native-safe-area-context";

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
  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={safeAreaEdges}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
        {footer ? (
          <View className="border-muted border-t px-5 py-4">{footer}</View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
