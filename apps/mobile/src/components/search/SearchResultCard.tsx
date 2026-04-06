import { SearchUserGame } from "@/src/app/(protected)/(tabs)/search";
import GameLogo from "@/src/components/games/GameLogo";
import Frame from "@/src/components/Frame";
import { User } from "@repo/types";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { colors } from "@repo/ui/colors";

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

	const USER_ICON_SIZE = 11;

	return (
		<Frame className="flex-row items-center h-18! justify-start gap-3! px-4! py-3!">
			{user.image ? (
				<Image
					source={{ uri: user.image }}
					className={`size-${USER_ICON_SIZE} rounded-full`}
					resizeMode="cover"
				/>
			) : (
				<View
					className={`size-${USER_ICON_SIZE} rounded-full bg-dark items-center justify-center`}
				>
					<Text className="text-sm font-mono-medium text-text">
						{getInitialsForFallbackPhoto(user.name)}
					</Text>
				</View>
			)}
			<View className="flex flex-col h-12 justify-between items-start gap-1">
				<View className="flex flex-row items-center gap-2">
					<Text className="text-sm font-sans-medium text-text">
						{user.name}
					</Text>
					{user.tag && (
						<Text className="text-sm leading-none font-mono-medium text-primary">
							@{user.tag}
						</Text>
					)}
				</View>
				<View className="flex-row flex-wrap gap-2">
					{games.map((game, index) => (
						<View
							key={`${game.gameId}-${index}-${game.nickname}`}
							className="flex-row items-center gap-2 border border-border bg-card pr-1.5 pl-2 py-1 max-w-full"
						>
							<GameLogo
								gameId={game.gameId}
								maxHeight={12}
								color={colors.destructive}
							/>
							<Text
								className="text-[11px] font-sans-medium text-text-secondary shrink min-w-0"
								numberOfLines={1}
							>
								{game.nickname}
							</Text>
						</View>
					))}
				</View>
			</View>
		</Frame>
	);
}
