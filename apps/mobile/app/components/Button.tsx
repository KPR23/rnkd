import { Pressable, Text } from "react-native";

export default function Button({
	variant,
	className,
	actionText,
}: {
	variant: "primary" | "secondary";
	className?: string;
	actionText: string;
}) {
	return (
		<Pressable
			className={`p-2 h-11 items-center justify-center active:opacity-70 ${variant === "primary" ? "bg-primary" : "bg-dark border border-gray"} ${className}`}
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
