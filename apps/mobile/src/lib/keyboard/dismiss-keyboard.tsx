import type { ReactNode } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  type ScrollViewProps,
} from "react-native";

type DismissKeyboardProps = {
  children: ReactNode;
  className?: string;
};

export function DismissKeyboard({ children, className }: DismissKeyboardProps) {
  return (
    <Pressable
      className={className ?? "flex-1"}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      {children}
    </Pressable>
  );
}

export function DismissKeyboardScrollView({
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode = "on-drag",
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      {...props}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={keyboardDismissMode}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
    >
      <Pressable className="grow" onPress={Keyboard.dismiss} accessible={false}>
        {children}
      </Pressable>
    </ScrollView>
  );
}
