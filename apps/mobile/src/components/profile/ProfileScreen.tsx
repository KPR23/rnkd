import Button from "@/src/components/Button";
import Frame from "@/src/components/Frame";
import ScreenTitle, { ScreenTitleAction } from "@/src/components/ScreenTitle";
import UserProfileImage from "@/src/components/UserProfileImage";
import { trpc } from "@/src/utils/trpc";
import type { GameAccount, User } from "@repo/types";
import { ScrollView, Text, View } from "react-native";
import ProfileContent from "./ProfileContent";
import { useRouter } from "expo-router";
import { useCallback } from "react";

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
	title,
	actions,
}: ProfileScreenProps) {
	const router = useRouter();

	return (
		<>
			{title ? (
				<ScreenTitle title={title} actions={actions} />
			) : (
				<View className="mt-2" />
			)}
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 96 }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<Frame>
					<View className="flex items-center gap-4">
						<UserProfileImage user={user} />
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
							onPress={() => (isOwnProfile ? router.push("/settings") : void 0)}
						/>
						<Button
							variant="secondary"
							actionText={isOwnProfile ? "Accounts" : "Message"}
							className="flex-1"
							onPress={() => (isOwnProfile ? router.push("/settings") : void 0)}
						/>
					</View>
				</Frame>

				{gameAccounts && gameAccounts.length > 0 ? (
					<ProfileContent gameAccounts={gameAccounts} />
				) : null}
			</ScrollView>
		</>
	);
}
