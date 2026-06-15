import React from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { colors } from "@repo/ui/colors";

type AppTextProps = TextProps & {
  weight?: "regular" | "medium";
  color?: string;
};

const fontFamilies: Record<NonNullable<AppTextProps["weight"]>, string> = {
  regular: "IBM Plex Sans",
  medium: "IBM Plex Sans",
};

export default function AppText({
  weight = "regular",
  style,
  color = colors.text,
  ...props
}: AppTextProps) {
  const fontStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const hasCustomFontFamily = Boolean(fontStyle?.fontFamily);

  return (
    <Text
      {...props}
      style={[
        !hasCustomFontFamily && {
          fontFamily: fontFamilies[weight],
          fontWeight: weight === "medium" ? "500" : "400",
        },
        { color },
        style,
      ]}
    />
  );
}
