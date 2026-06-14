import { type PropsWithChildren, type ReactNode } from "react";
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import StickyHeaderShell, {
  useStickyHeaderScrollHandler,
} from "@/src/components/StickyHeaderShell";

type ScreenScrollProps = PropsWithChildren<
  {
    header: ReactNode;
    scrollHeader?: ReactNode;
    contentContainerStyle?: StyleProp<ViewStyle>;
  } & Omit<ScrollViewProps, "children">
>;

function ScreenScrollBody({
  scrollHeader,
  children,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode = "on-drag",
  onScroll,
  scrollEventThrottle = 16,
  ...scrollProps
}: Omit<ScreenScrollProps, "header">) {
  const onStickyHeaderScroll = useStickyHeaderScrollHandler();

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      scrollEventThrottle={scrollEventThrottle}
      onScroll={(event) => {
        onStickyHeaderScroll?.(event);
        onScroll?.(event);
      }}
      contentContainerStyle={[
        {
          gap: 20,
          paddingTop: 16,
          paddingBottom: 24,
        },
        contentContainerStyle,
      ]}
      {...scrollProps}
    >
      {scrollHeader}
      {children}
    </ScrollView>
  );
}

export default function ScreenScroll({
  header,
  ...bodyProps
}: ScreenScrollProps) {
  return (
    <StickyHeaderShell header={header}>
      <ScreenScrollBody {...bodyProps} />
    </StickyHeaderShell>
  );
}
