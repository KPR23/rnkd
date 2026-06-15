import React from "react";
import {
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { IconContext } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface Props extends Pick<TouchableOpacityProps, "onPress" | "disabled"> {
  variant: ButtonVariant;
  className?: string;
  actionText: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

const baseClassName = "h-12 flex-row items-center justify-center gap-2";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-button border border-border",
  destructive: "bg-destructive border border-destructiveBorder",
};

const textColors: Record<ButtonVariant, string> = {
  primary: colors.text,
  secondary: colors.text,
  destructive: colors.text,
};

const iconColors: Record<ButtonVariant, string> = {
  primary: colors.text,
  secondary: colors.gray,
  destructive: colors.textSecondary,
};

export default function Button({
  variant,
  className,
  actionText,
  icon,
  onPress,
  ...touchableProps
}: Props) {
  const isDisabled = !!touchableProps.disabled;
  const iconContext = {
    size: 20,
    color: isDisabled ? colors.border : iconColors[variant],
    weight: "bold" as const,
  };

  return (
    <IconContext.Provider value={iconContext}>
      <TouchableOpacity
        activeOpacity={0.7}
        className={`${baseClassName} ${variantStyles[variant]} ${className ?? ""} ${
          isDisabled ? "border-muted bg-background border" : ""
        }`}
        style={
          variant === "destructive"
            ? { borderColor: colors.destructiveBorder }
            : undefined
        }
        onPress={onPress}
        {...touchableProps}
      >
        <AppText
          className="text-sm"
          color={isDisabled ? colors.border : textColors[variant]}
          weight="medium"
        >
          {actionText}
        </AppText>
        {icon}
      </TouchableOpacity>
    </IconContext.Provider>
  );
}
