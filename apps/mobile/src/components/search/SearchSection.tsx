import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SearchSectionProps {
	title: string;
	children: ReactNode;
	actionLabel?: string;
	onActionPress?: () => void;
}

export default function SearchSection({
	title,
	children,
	actionLabel,
	onActionPress,
}: SearchSectionProps) {
	const hasAction = actionLabel && onActionPress;

	return (
		<View className="flex flex-col gap-2">
			<View className="flex flex-row items-center gap-2 justify-between">
				<Text className="text-sm font-sans-medium text-text">{title}</Text>
				{hasAction && (
					<TouchableOpacity
						activeOpacity={0.7}
						className="text-sm font-sans-medium text-text-secondary"
						onPress={onActionPress}
					>
						<Text className="text-sm font-sans-medium text-primary">
							{actionLabel}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{children}
		</View>
	);
}
