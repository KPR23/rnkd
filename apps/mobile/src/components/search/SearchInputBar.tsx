import { TextInput, TouchableOpacity, View } from "react-native";

import { MagnifyingGlassIcon, QrCodeIcon, XIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";

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
    <View className="flex w-full flex-row items-start gap-3">
      <View className="bg-card border-border h-[54px] min-w-0 flex-1 flex-row items-center gap-3 border px-4">
        <MagnifyingGlassIcon size={24} color={colors.textSecondary} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          className="text-text h-[54px] min-w-0 flex-1 text-base leading-5"
          autoCorrect={false}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
        />
        {value.length > 0 && onClear ? (
          <TouchableOpacity
            activeOpacity={0.7}
            className="size-6 items-center justify-center"
            onPress={onClear}
          >
            <XIcon size={20} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-button border-border size-[54px] items-center justify-center border"
        onPress={onQrPress}
      >
        <QrCodeIcon size={32} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
