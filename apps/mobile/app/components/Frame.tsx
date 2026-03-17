import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function Frame({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<View
			className={`text-text border-dark flex-col gap-5 items-center justify-center border p-5 ${className ?? ""}`}
		>
			{children}
		</View>
	);
}
