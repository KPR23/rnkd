import Button from "@/app/components/Button";
import Frame from "@/app/components/Frame";
import ScreenTitle, {
	type ScreenTitleAction,
} from "@/app/components/ScreenTitle";
import Text from "@/app/components/Text";
import type { GameAccount, User } from "@repo/types";
import { Image, View } from "react-native";
import ProfileContent from "./ProfileContent";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";

export type ProfileScreenProps = {
	user: User;
	isOwnProfile: boolean;
	gameAccounts: GameAccount[] | undefined;
	title?: string;
	actions?: ScreenTitleAction[];
};

export default function ProfileScreen({
	user,
	isOwnProfile,
	gameAccounts,
	title = "Profile",
	actions,
}: ProfileScreenProps) {
	const userImage = user.image ? (
		<Image
			source={{ uri: user.image }}
			className="w-full h-full rounded-full"
			resizeMode="cover"
			style={{ width: 64, height: 64 }}
		/>
	) : (
		<View className="w-16 h-16 rounded-full bg-dark flex items-center justify-center">
			<Text className="text-text text-xl font-mono-medium">
				{getInitialsForFallbackPhoto(user.name)}
			</Text>
		</View>
	);

	return (
		<>
			<ScreenTitle title={title} actions={actions} />
			<Frame className="mt-4">
				<View className="flex items-center gap-4">
					{userImage}
					<View className="flex flex-col items-center gap-1 text-center">
						<Text className="text-2xl font-sans-bold text-text">
							{user.name}
						</Text>
						{user.tag && (
							<Text className="font-mono-bold text-base text-primary">
								@{user.tag}
							</Text>
						)}
					</View>
				</View>
				<View className="w-full flex-row gap-3">
					<Button
						variant="primary"
						actionText={isOwnProfile ? "Edit profile" : "Add friend"}
						className="flex-1"
						onPress={() => void 0}
					/>
					<Button
						variant="secondary"
						actionText={isOwnProfile ? "Accounts" : "Message"}
						className="flex-1"
						onPress={() => void 0}
					/>
				</View>
			</Frame>

			<ProfileContent gameAccounts={gameAccounts} />
		</>
	);
}
