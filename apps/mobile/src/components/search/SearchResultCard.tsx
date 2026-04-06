import { SearchUserGame } from "@/src/app/(protected)/(tabs)/search";
import Frame from "@/src/components/Frame";
import GameLogo from "@/src/components/games/GameLogo";
import { User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { CaretRightIcon } from "phosphor-react-native";
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

	const USER_ICON_SIZE = 12;
	const hasGames = games.length > 0;

	return (
		<Frame className="flex-row items-center h-20! justify-start gap-3! p-4!">
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
			<View
				className={`flex-1 h-11 gap-1 items-start ${hasGames ? "justify-between" : "justify-center"}`}
			>
				<View
					className={`flex-row flex-wrap items-baseline gap-x-2 gap-y-0.5 ${hasGames ? "" : "justify-center"}`}
				>
					<Text className="text-sm leading-none font-sans-medium text-text">
						{user.name}
					</Text>
					{user.tag ? (
						<Text className="text-sm leading-none font-mono-medium text-primary">
							@{user.tag}
						</Text>
					) : null}
				</View>
				{hasGames ? (
					<View className="flex-row flex-wrap gap-x-2 gap-y-1.5 w-full">
						{games.map((game, index) => (
							<View
								key={`${game.gameId}-${index}-${game.nickname}`}
								className="flex-row items-center gap-1.5 border border-border bg-card rounded-none pl-2 pr-1.5 py-1 max-w-full"
							>
								<GameLogo
									gameId={game.gameId}
									maxHeight={12}
									color={colors.gray}
								/>
								<Text
									className="text-[11px] font-sans-medium text-text shrink min-w-0"
									numberOfLines={1}
								>
									{game.nickname}
								</Text>
							</View>
						))}
					</View>
				) : null}
			</View>
			<View className="shrink-0 self-center">
				<CaretRightIcon weight="bold" color={colors.textMuted} size={16} />
			</View>
		</Frame>
	);
}
