import Frame from "@/src/components/Frame";
import { ActivityIndicator, Text, View } from "react-native";

interface SearchResultCardProps {
	title: string;
	isLoading: boolean;
}

export default function SearchResultCard({
	title,
	isLoading,
}: SearchResultCardProps) {
	if (isLoading) {
		return (
			<View className="flex flex-row items-center justify-center">
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<Frame>
			<Text className="text-sm font-sans-medium text-text">{title}</Text>
		</Frame>
	);
}
