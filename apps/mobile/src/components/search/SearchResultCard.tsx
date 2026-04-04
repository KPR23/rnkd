import Frame from "@/src/components/Frame";
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
		<Frame>
			<Text className="text-sm font-sans-medium text-text">{title}</Text>
		</Frame>
	);
}
