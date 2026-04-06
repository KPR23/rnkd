import { SearchUserGame } from "@/src/app/(protected)/(tabs)/search";
import Frame from "@/src/components/Frame";
import { User } from "@repo/types";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { ActivityIndicator, Image, Text, View } from "react-native";

interface UserSearchResultCardProps {
	user: Pick<User, "id" | "name" | "tag" | "image">;
	games: SearchUserGame[];
	isLoading?: boolean;
}

export default function UserSearchResultCard({
	user,
	games,
	isLoading,
}: UserSearchResultCardProps) {
	if (isLoading) {
		return (
			<Frame className="flex-row items-center justify-center p-4">
				<ActivityIndicator />
			</Frame>
		);
	}

	return (
		<Frame className="flex-row items-center justify-start gap-3 p-3">
			{user.image ? (
				<Image
					source={{ uri: user.image }}
					className="size-11 rounded-full"
					resizeMode="cover"
				/>
			) : (
				<View className="size-11 rounded-full bg-dark items-center justify-center">
					<Text className="text-sm font-mono-medium text-text">
						{getInitialsForFallbackPhoto(user.name)}
					</Text>
				</View>
			)}
			<View className="flex flex-col gap-0.5 items-start justify-start">
				<View className="flex-1 flex-row items-center gap-2">
					<Text className="text-sm font-sans-medium text-text">
						{user.name}
					</Text>
					{user.tag ? (
						<Text className="text-sm font-sans-medium text-text-secondary">
							@{user.tag}
						</Text>
					) : null}
				</View>
				<View className="flex-row items-center gap-2 flex-wrap">
					{games.map((game, index) => (
						<Text
							key={`${game.gameId}-${index}-${game.nickname}`}
							className="text-sm font-sans-medium text-text"
						>
							{game.gameId}:{game.nickname}
						</Text>
					))}
				</View>
			</View>
		</Frame>
	);
}
