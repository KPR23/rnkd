import { Pressable, Text } from "react-native";

interface Props {
	variant: "primary" | "secondary";
	className?: string;
	actionText: string;
}

export default function Button({ variant, className, actionText }: Props) {
	return (
		<Pressable
			className={`will-change-pressable p-2 h-11 items-center justify-center active:opacity-70 ${variant === "primary" ? "bg-primary" : "bg-dark border border-gray"} ${className}`}
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
