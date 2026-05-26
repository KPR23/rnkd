import React from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

type AppTextProps = TextProps & {
  weight?: "regular" | "medium";
};

const fontFamilies: Record<NonNullable<AppTextProps["weight"]>, string> = {
  regular: "IBM Plex Sans",
  medium: "IBM Plex Sans",
};

export default function AppText({
  weight = "regular",
  style,
  ...props
}: AppTextProps) {
  const fontStyle = StyleSheet.flatten(style) as TextStyle | undefined;

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fontFamilies[weight],
          fontWeight: weight === "medium" ? "500" : "400",
        },
        fontStyle?.fontFamily ? null : undefined,
        style,
      ]}
    />
  );
}
