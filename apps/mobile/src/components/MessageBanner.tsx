import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, View } from "react-native";

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

const ANIMATION_DURATION_MS = 220;

export default function MessageBanner({
  message,
  onDismiss,
}: MessageBannerProps) {
  const keyboardOffset = useKeyboardOffset();
  const [visibleMessage, setVisibleMessage] = useState(message);
  const translateY = useRef(new Animated.Value(BOTTOM_DOCK_HEIGHT)).current;

  useEffect(() => {
    if (message) {
      setVisibleMessage(message);
      translateY.setValue(BOTTOM_DOCK_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateY, {
      toValue: BOTTOM_DOCK_HEIGHT,
      duration: ANIMATION_DURATION_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisibleMessage(null);
      }
    });
  }, [message, translateY]);

  return (
    <Modal
      visible={!!visibleMessage}
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
        {visibleMessage ? (
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss message"
              className={`justify-start border-t px-5 pt-4 ${
                visibleMessage.variant === "error"
                  ? "border-destructiveBorder bg-destructive"
                  : "border-muted bg-sheet"
              }`}
              style={{ height: BOTTOM_DOCK_HEIGHT }}
              onPress={onDismiss}
            >
              <AppText
                className="text-sm leading-5"
                color={
                  visibleMessage.variant === "error"
                    ? colors.destructiveText
                    : colors.text
                }
              >
                {visibleMessage.text}
              </AppText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}
