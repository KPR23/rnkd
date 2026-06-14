import { Modal, Pressable, View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { BOTTOM_DOCK_HEIGHT } from "@/src/constants/bottom-dock";
import { useKeyboardOffset } from "@/src/lib/keyboard/keyboard-offset-provider";

type MessageBannerProps = {
  message: {
    id: number;
    text: string;
    variant: "default" | "error";
  } | null;
  onDismiss: () => void;
};

export default function MessageBanner({
  message,
  onDismiss,
}: MessageBannerProps) {
  const keyboardOffset = useKeyboardOffset();

  return (
    <Modal
      visible={!!message}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 justify-end"
        pointerEvents="box-none"
        style={{ marginBottom: keyboardOffset }}
      >
        {message ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss message"
            className={`justify-start border-t px-5 pt-4 ${
              message.variant === "error"
                ? "border-destructiveBorder bg-destructive/20"
                : "border-muted bg-sheet"
            }`}
            style={{ height: BOTTOM_DOCK_HEIGHT }}
            onPress={onDismiss}
          >
            <AppText
              className="text-sm leading-5"
              color={
                message.variant === "error"
                  ? colors.destructiveText
                  : colors.text
              }
            >
              {message.text}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}
