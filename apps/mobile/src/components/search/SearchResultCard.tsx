import { Text, View } from "react-native";

interface SearchResultCardProps {
	title: string;
	description: string;
}

export default function SearchResultCard({
	title,
	description,
}: SearchResultCardProps) {
	return (
		<View className="flex flex-col gap-2 mt-4">
			<Text className="text-sm font-sans-medium text-text">{title}</Text>
		</View>
	);
}
