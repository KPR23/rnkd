import Frame from "@/src/components/Frame";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { ActivityIndicator, Image, Text, View } from "react-native";

interface SearchResultCardProps {
	title: string;
	subtitle?: string;
	imageUrl?: string | null;
	isLoading?: boolean;
}

export default function SearchResultCard({
	title,
	subtitle,
	imageUrl,
	isLoading,
}: SearchResultCardProps) {
	if (isLoading) {
		return (
			<Frame className="flex-row items-center justify-center p-4">
				<ActivityIndicator />
			</Frame>
		);
	}

	return (
		<Frame className="flex-row items-center justify-start gap-3 p-3">
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					className="size-11 rounded-full"
					resizeMode="cover"
				/>
			) : (
				<View className="size-11 rounded-full bg-dark items-center justify-center">
					<Text className="text-sm font-mono-medium text-text">
						{getInitialsForFallbackPhoto(title)}
					</Text>
				</View>
			)}
			<View className="flex-1 gap-0.5">
				<Text className="text-sm font-sans-medium text-text">{title}</Text>
				{subtitle ? (
					<Text className="text-sm font-sans-medium text-text-secondary">
						@{subtitle}
					</Text>
				) : null}
			</View>
		</Frame>
	);
}
