import { colors } from "@repo/ui/colors";
import { CaretDownIcon, CaretUpIcon } from "phosphor-react-native";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SearchSectionProps {
	title: string;
	children: ReactNode;
	actionLabel?: string;
	onActionPress?: () => void;
	collapsed?: boolean;
	onCollapsePress?: () => void;
}

export default function SearchSection({
	title,
	children,
	actionLabel,
	onActionPress,
	collapsed = false,
	onCollapsePress,
}: SearchSectionProps) {
	const hasAction = actionLabel && onActionPress;
	const isCollapsible = Boolean(onCollapsePress);

	return (
		<View className="flex flex-col gap-2">
			<View className="flex flex-row items-center gap-2 justify-between">
				{isCollapsible && (
					<TouchableOpacity
						onPress={onCollapsePress}
						className="flex flex-row items-center gap-1.5"
					>
						<Text className="text-sm font-sans-medium text-text">{title}</Text>
						{collapsed ? (
							<CaretDownIcon size={16} weight="bold" color={colors.textMuted} />
						) : (
							<CaretUpIcon size={16} weight="bold" color={colors.textMuted} />
						)}
					</TouchableOpacity>
				)}

				{!isCollapsible && (
					<Text className="text-sm font-sans-medium text-text">{title}</Text>
				)}

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

			{!collapsed && children}
		</View>
	);
}
