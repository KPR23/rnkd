import { Text, View } from "react-native";

type Props = {
  globalRs: number;
};

export default function RSBadge({ globalRs }: Props) {
  return (
    <View className="bg-card border-muted h-8 flex-row items-center justify-center gap-0.75 rounded-full border px-2">
      <Text className="text-text text-base leading-0.5 font-medium tracking-[-0.5px]">
        {globalRs}
      </Text>
      <Text className="text-primary text-sm leading-px font-medium">RS</Text>
    </View>
  );
}
