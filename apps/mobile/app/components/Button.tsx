import { Pressable, PressableProps, Text } from "react-native";

interface Props extends Pick<PressableProps, "onPress" | "disabled"> {
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
	...pressableProps
}: Props) {
	return (
		<Pressable
			className={`will-change-pressable p-2 h-11 items-center justify-center active:opacity-70 ${variant === "primary" ? "bg-primary" : "bg-dark border border-border"} ${className ?? ""}`}
			onPress={onPress}
			{...pressableProps}
		>
			<Text
				className="text-text uppercase text-sm"
				style={{ fontFamily: "JetBrainsMono_600SemiBold" }}
			>
				{actionText}
			</Text>
		</Pressable>
	);
}
