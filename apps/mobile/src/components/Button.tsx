import { Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface Props extends Pick<TouchableOpacityProps, "onPress" | "disabled"> {
	variant: "primary" | "secondary";
	className?: string;
	actionText: string;
	onPress: () => void;
}

export default function Button({
	variant,
	className,
	actionText,
	onPress,
	...touchableProps
}: Props) {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			className={`h-11 items-center justify-center ${variant === "primary" ? "bg-primary" : "bg-dark border border-border"} ${className ?? ""}`}
			onPress={onPress}
			{...touchableProps}
		>
			<Text
				className="text-text uppercase text-sm"
				style={{ fontFamily: "JetBrainsMono_600SemiBold" }}
			>
				{actionText}
			</Text>
		</TouchableOpacity>
	);
}
