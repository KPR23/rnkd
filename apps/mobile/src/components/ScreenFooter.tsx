import { type PropsWithChildren } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@repo/ui/colors";
import Button from "@/src/components/Button";
import { useKeyboardOffset } from "@/src/lib/keyboard/keyboard-offset-provider";

export const FOOTER_BUTTON_CLASS = "h-13.5 min-w-0 flex-1";
export const FOOTER_SINGLE_BUTTON_CLASS = "h-13.5";
export const FOOTER_ACTIONS_GAP_CLASS = "gap-2.5";

export type ScreenFooterAction = {
  text: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ScreenFooterShell({ children }: PropsWithChildren) {
  const keyboardVisible = useKeyboardOffset() > 0;

  return (
    <View
      className={`h-full justify-start ${keyboardVisible ? "gap-2 pt-2" : "gap-3 pt-3"}`}
    >
      {children}
    </View>
  );
}

function FooterActions({
  primaryAction,
  secondaryAction,
}: {
  primaryAction: ScreenFooterAction;
  secondaryAction?: ScreenFooterAction;
}) {
  const primaryVariant =
    primaryAction.disabled && !secondaryAction ? "secondary" : "primary";

  if (secondaryAction) {
    return (
      <View className={`flex-row ${FOOTER_ACTIONS_GAP_CLASS}`}>
        <Button
          actionText={secondaryAction.text}
          className={FOOTER_BUTTON_CLASS}
          disabled={secondaryAction.disabled}
          variant="secondary"
          onPress={secondaryAction.onPress}
        />
        <Button
          actionText={primaryAction.text}
          className={FOOTER_BUTTON_CLASS}
          disabled={primaryAction.disabled}
          variant={primaryAction.disabled ? "secondary" : "primary"}
          onPress={primaryAction.onPress}
        />
      </View>
    );
  }

  return (
    <Button
      actionText={primaryAction.text}
      className={FOOTER_SINGLE_BUTTON_CLASS}
      disabled={primaryAction.disabled}
      variant={primaryVariant}
      onPress={primaryAction.onPress}
    />
  );
}

export type ScreenFooterProps = {
  primaryAction: ScreenFooterAction;
  secondaryAction?: ScreenFooterAction;
  loading?: boolean;
};

export function ScreenFooter({
  primaryAction,
  secondaryAction,
  loading,
}: ScreenFooterProps) {
  return (
    <ScreenFooterShell>
      {loading ? (
        <View
          className={`${FOOTER_SINGLE_BUTTON_CLASS} items-center justify-center`}
        >
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <FooterActions
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
      )}
    </ScreenFooterShell>
  );
}
