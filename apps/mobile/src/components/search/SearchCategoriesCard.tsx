import { colors } from "@repo/ui/colors";
import { IconContext } from "phosphor-react-native";
import { Text, View } from "react-native";

interface SearchCategoriesCardProps {
	name: string;
	icon: React.ReactNode;
	color: string;
}

export default function SearchCategoriesCard({
	name,
	icon,
	color,
}: SearchCategoriesCardProps) {
	const iconContext = {
		size: 20,
		color: color,
		weight: "regular" as const,
	};

	return (
		<IconContext.Provider value={iconContext}>
			<View className="w-full flex flex-row items-center h-11 gap-1.5 border border-border pl-3 pr-3">
				{icon}
				<Text className="text-text-secondary font-sans-medium text-sm">
					{name}
				</Text>
			</View>
		</IconContext.Provider>
	);
}
