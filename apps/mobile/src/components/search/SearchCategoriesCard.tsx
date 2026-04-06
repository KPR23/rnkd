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
	selected: boolean;
}

export default function SearchCategoriesCard({
	name,
	icon,
	color,
	onPress,
	selected,
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
				className="w-full flex flex-row items-center h-10 gap-1.5 border pr-3 pl-2.5"
				style={
					selected
						? {
								borderColor: color,
								backgroundColor: `${color}1A`,
							}
						: { borderColor: colors.border }
				}
				onPress={onPress}
			>
				{icon}
				<Text
					className={`font-sans-medium text-sm ${selected ? "text-text" : "text-text-secondary"}`}
				>
					{name}
				</Text>
			</TouchableOpacity>
		</IconContext.Provider>
	);
}
