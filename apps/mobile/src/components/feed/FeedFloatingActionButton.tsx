import { Pressable, View } from "react-native";

import { PlusIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";

type Props = {
  onPress: () => void;
  bottomOffset?: number;
};

export default function FeedFloatingActionButton({
  onPress,
  bottomOffset = 100,
}: Props) {
  return (
    <View
      className="absolute right-5"
      style={{ bottom: bottomOffset }}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create post"
        className="bg-primary size-12 items-center justify-center shadow-lg"
        onPress={onPress}
      >
        <PlusIcon size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}
