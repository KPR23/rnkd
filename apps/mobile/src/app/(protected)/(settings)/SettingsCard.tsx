import { colors } from "@repo/ui/colors";
import { CaretRightIcon, IconContext } from "phosphor-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface SettingsCardProps {
	title: string;
	icon: React.ReactNode;
	onPress: () => void;
}

const iconContext = {
	size: 20,
	color: colors.gray,
	weight: "bold" as const,
};

export default function SettingsCard({
	title,
	icon,
	onPress,
}: SettingsCardProps) {
	return (
		<IconContext.Provider value={iconContext}>
			<TouchableOpacity
				activeOpacity={0.7}
				className="flex flex-row gap-2 justify-between! border border-border bg-card px-4 items-center h-12"
				onPress={onPress}
			>
				<View className="flex flex-row gap-3 items-center">
					{icon}
					<Text className="font-sans-semibold text-sm text-text">{title}</Text>
				</View>
				<CaretRightIcon />
			</TouchableOpacity>
		</IconContext.Provider>
	);
}
