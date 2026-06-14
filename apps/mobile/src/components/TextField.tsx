import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type TextFieldProps = TextInputProps & {
  className?: string;
  search?: boolean;
  onClear?: () => void;
};

export function TextField({
  search,
  onClear,
  className,
  style,
  placeholder,
  value,
  ...props
}: TextFieldProps) {
  const showPlaceholder = !value;

  return (
    <View
      className={`border-border h-13.5 flex-row items-center gap-3 border px-4 ${className ?? ""}`}
    >
      {search ? (
        <MagnifyingGlassIcon size={24} color={colors.textSecondary} />
      ) : null}
      <View className="relative h-13.5 min-w-0 flex-1 justify-center">
        {showPlaceholder && placeholder ? (
          <View pointerEvents="none" className="absolute inset-0 justify-center">
            <AppText
              className="text-base"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {placeholder}
            </AppText>
          </View>
        ) : null}
        <TextInput
          placeholder=""
          value={value}
          className="text-text h-13.5 w-full text-base leading-13.5"
          style={[{ includeFontPadding: false }, style]}
          autoCorrect={false}
          {...props}
        />
      </View>
      {value && onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear"
          className="ml-auto size-6 items-center justify-center"
          onPress={onClear}
        >
          <XIcon size={20} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

type TextFieldMultilineProps = TextInputProps & {
  className?: string;
};

export function TextFieldMultiline({
  className,
  style,
  ...props
}: TextFieldMultilineProps) {
  return (
    <View className={`border-border border px-4 py-3 ${className ?? ""}`}>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        className="text-text min-w-0 flex-1 text-base leading-5"
        style={[{ includeFontPadding: false, textAlignVertical: "top" }, style]}
        multiline
        autoCorrect={false}
        {...props}
      />
    </View>
  );
}
