import { Modal, Pressable, View } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

import type { FeedMenuAnchor } from "./FeedCommentRow";

export type FeedActionMenuItem = {
  label: string;
  accessibilityLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  anchor: FeedMenuAnchor | null;
  items: FeedActionMenuItem[];
  onClose: () => void;
};

export default function FeedActionMenu({
  visible,
  anchor,
  items,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          className="absolute inset-0"
          onPress={onClose}
        />
        {anchor ? (
          <View
            className="border-muted bg-card absolute min-w-48 border p-2"
            style={{
              top: anchor.top,
              right: anchor.right,
            }}
          >
            {items.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={item.accessibilityLabel ?? item.label}
                className="px-3 py-3"
                disabled={item.disabled}
                onPress={item.onPress}
              >
                <AppText
                  className="text-sm"
                  color={item.destructive ? colors.destructiveText : colors.text}
                  weight="medium"
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
