import { TouchableOpacity, View } from "react-native";

import { QrCodeIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import { TextField } from "@/src/components/TextField";

interface SearchInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onClear?: () => void;
  onQrPress?: () => void;
}

export default function SearchInputBar({
  value,
  onChangeText,
  onSubmitEditing,
  onClear,
  onQrPress,
}: SearchInputBarProps) {
  return (
    <View className="w-full flex-row items-start gap-2.5">
      <TextField
        search
        className="bg-card min-w-0 flex-1"
        placeholder="Search"
        autoCapitalize="none"
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onClear={onClear}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-button border-border size-13.5 items-center justify-center border"
        onPress={onQrPress}
      >
        <QrCodeIcon size={32} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
