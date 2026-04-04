import Frame from "@/src/components/Frame";
import { Text, View } from "react-native";

interface SearchResultCardProps {
	title: string;
}

export default function SearchResultCard({ title }: SearchResultCardProps) {
	return (
		<Frame>
			<Text className="text-sm font-sans-medium text-text">{title}</Text>
		</Frame>
	);
}
