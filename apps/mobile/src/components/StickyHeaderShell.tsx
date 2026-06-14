import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";

type StickyHeaderScrollHandler = (
  event: NativeSyntheticEvent<NativeScrollEvent>,
) => void;

const StickyHeaderScrollContext =
  createContext<StickyHeaderScrollHandler | null>(null);

export function useStickyHeaderScrollHandler(): StickyHeaderScrollHandler | null {
  return useContext(StickyHeaderScrollContext);
}

type StickyHeaderShellProps = PropsWithChildren<{
  header: ReactNode;
}>;

export default function StickyHeaderShell({
  header,
  children,
}: StickyHeaderShellProps) {
  const [showBorder, setShowBorder] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setShowBorder((current) => {
        const next = offsetY > 0;
        return current === next ? current : next;
      });
    },
    [],
  );

  return (
    <StickyHeaderScrollContext.Provider value={onScroll}>
      <View className="min-h-0 flex-1">
        <View
          className={`bg-background border-b pb-3 ${showBorder ? "border-muted" : "border-transparent"}`}
        >
          {header}
        </View>
        <View className="min-h-0 flex-1">{children}</View>
      </View>
    </StickyHeaderScrollContext.Provider>
  );
}
