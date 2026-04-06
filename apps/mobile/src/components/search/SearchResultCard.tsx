import { SearchUserGame } from "@/src/app/(protected)/(tabs)/search";
import Frame from "@/src/components/Frame";
import GameLogo from "@/src/components/games/GameLogo";
import {
	type SearchProfileKind,
	SEARCH_PROFILE_LABELS,
	User,
} from "@repo/types";
import { colors, tagColors } from "@repo/ui/colors";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { CaretRightIcon } from "phosphor-react-native";
import {
	ActivityIndicator,
	Image,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface UserSearchResultCardProps {
	user: Pick<User, "id" | "name" | "tag" | "image">;
	type: SearchProfileKind;
	games: SearchUserGame[];
	isLoading?: boolean;
	onPress: () => void;
}

export default function UserSearchResultCard({
	user,
	type: resultType,
	games,
	isLoading,
	onPress,
}: UserSearchResultCardProps) {
	if (isLoading) {
		return (
			<Frame className="flex-row items-center justify-center p-4">
				<ActivityIndicator />
			</Frame>
		);
	}

	const hasGames = games.length > 0;

	return (
		<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
			<View className="border bg-card border-border px-4 py-3 flex-row items-center justify-start gap-3">
				{user.image ? (
					<Image
						source={{ uri: user.image }}
						className={`size-11 rounded-full`}
						resizeMode="cover"
					/>
				) : (
					<View
						className={`size-11 rounded-full bg-dark items-center justify-center`}
					>
						<Text className="text-sm font-mono-medium text-text">
							{getInitialsForFallbackPhoto(user.name)}
						</Text>
					</View>
				)}
				<View className="flex-1 min-w-0 gap-0.5 items-start justify-center">
					<View className="w-full min-w-0 flex-row items-center gap-1">
						<Text
							className="text-sm leading-none shrink-0 font-mono-semibold text-text"
							numberOfLines={1}
						>
							@{user.tag}
						</Text>
						<Text className="text-sm leading-none font-sans-semibold text-text-secondary">
							·
						</Text>
						<Text
							className={`text-sm leading-none font-sans-semibold text-primary`}
							style={{ color: tagColors[resultType] }}
						>
							{SEARCH_PROFILE_LABELS[resultType]}
						</Text>
					</View>
					<Text
						className="text-xs leading-none font-sans-medium text-text-secondary min-w-0 shrink"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{user.name}
					</Text>
				</View>
				<View className="shrink-0 self-center">
					<CaretRightIcon weight="bold" color={colors.textMuted} size={16} />
				</View>
			</View>
		</TouchableOpacity>
	);
}
