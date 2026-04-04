import { colors } from "@repo/ui/colors";
import { IconContext } from "phosphor-react-native";
import {
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from "react-native";

interface SearchCategoriesCardProps {
	name: string;
	icon: React.ReactNode;
	color: string;
	onPress: () => void;
}

export default function SearchCategoriesCard({
	name,
	icon,
	color,
	onPress,
}: SearchCategoriesCardProps) {
	const iconContext = {
		size: 20,
		color: color,
		weight: "regular" as const,
	};

	return (
		<IconContext.Provider value={iconContext}>
			<TouchableOpacity
				activeOpacity={0.7}
				className="w-full flex flex-row items-center h-11 gap-1.5 border border-border pl-3 pr-3"
				onPress={onPress}
			>
				{icon}
				<Text className="text-text-secondary font-sans-medium text-sm">
					{name}
				</Text>
			</TouchableOpacity>
		</IconContext.Provider>
	);
}
