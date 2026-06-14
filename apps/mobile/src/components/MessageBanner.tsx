import { Modal, Pressable, View } from "react-native";

import { colors } from "@repo/ui/colors";
import Animated, { FadeOutDown, SlideInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/src/components/AppText";
import {
  BOTTOM_DOCK_CONTENT_HEIGHT,
  BOTTOM_DOCK_ENTER_DURATION_MS,
  BOTTOM_DOCK_EXIT_DURATION_MS,
} from "@/src/constants/bottom-dock";

type MessageBannerProps = {
  message: {
    id: number;
    text: string;
    variant: "default" | "error";
  } | null;
  onDismiss: () => void;
};

export default function MessageBanner({ message, onDismiss }: MessageBannerProps) {
  return (
    <Modal
      visible={!!message}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-end" pointerEvents="box-none">
        {message ? (
          <SafeAreaView edges={["bottom"]} pointerEvents="box-none">
            <Animated.View
              key={message.id}
              entering={SlideInUp.duration(BOTTOM_DOCK_ENTER_DURATION_MS)}
              exiting={FadeOutDown.duration(BOTTOM_DOCK_EXIT_DURATION_MS)}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss message"
                className="border-muted bg-sheet border-t px-5 py-4"
                onPress={onDismiss}
              >
                <View
                  className="justify-center"
                  style={{ height: BOTTOM_DOCK_CONTENT_HEIGHT }}
                >
                  <AppText className="text-sm leading-5" color={colors.text}>
                    {message.text}
                  </AppText>
                </View>
              </Pressable>
            </Animated.View>
          </SafeAreaView>
        ) : null}
      </View>
    </Modal>
  );
}
