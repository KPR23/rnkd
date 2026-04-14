import { colors } from "@repo/ui/colors";
import { IconContext } from "phosphor-react-native";
import React from "react";
import {
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from "react-native";

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
	secondary: "bg-dark border border-border",
	destructive: "bg-destructive border border-destructiveBorder",
};

const textColors: Record<ButtonVariant, string> = {
	primary: "text-text",
	secondary: "text-text",
	destructive: "text-text",
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
	const iconContext = {
		size: 20,
		color: iconColors[variant],
		weight: "bold" as const,
	};

	return (
		<IconContext.Provider value={iconContext}>
			<TouchableOpacity
				activeOpacity={0.7}
				className={`${baseClassName} ${variantStyles[variant]} ${className ?? ""}`}
				style={
					variant === "destructive"
						? { borderColor: colors.destructiveBorder }
						: undefined
				}
				onPress={onPress}
				{...touchableProps}
			>
				<Text
					className={`${textColors[variant]} text-sm uppercase`}
					style={{ fontFamily: "JetBrainsMono_600SemiBold" }}
				>
					{actionText}
				</Text>
				{icon}
			</TouchableOpacity>
		</IconContext.Provider>
	);
}
