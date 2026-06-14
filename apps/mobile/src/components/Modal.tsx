import { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { XIcon } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

export default function CustomModal({
  children,
  visible,
  onClose,
  title,
  headerCenter,
  footer,
}: PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  headerCenter?: ReactNode;
  footer?: ReactNode;
}>) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <View className="bg-sheet flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <View className="border-muted border-b px-5 py-2">
              <View className="mb-3 items-center">
                <View className="bg-muted h-1 w-10 rounded-full" />
              </View>
              <View className="flex-row items-center">
                <View className="w-10" />
                <View className="min-h-10 flex-1 items-center justify-center px-2">
                  {headerCenter ? (
                    headerCenter
                  ) : title ? (
                    <AppText className="text-center text-lg" weight="medium">
                      {title}
                    </AppText>
                  ) : null}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                  accessible
                  importantForAccessibility="yes"
                  className="h-10 w-10 items-center justify-center"
                >
                  <XIcon size={22} color={colors.textMuted} weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 24,
              }}
            >
              {children}
            </ScrollView>
            {footer ? (
              <View className="border-border bg-sheet border-t px-5 py-4">
                {footer}
              </View>
            ) : null}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
