import Screen from "@/src/components/Screen";
import ProfileScreen from "@/src/components/profile/ProfileScreen";
import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";
import type { User } from "@repo/types";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

function toProfileUser(u: {
	id: string;
	name: string;
	tag: string | null;
	image: string | null;
}): User {
	return {
		...u,
		email: "",
		emailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as User;
}

export default function PlayerProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: session } = useAuth();

	const {
		data: publicUser,
		isLoading: isLoadingUser,
		isError: isUserError,
	} = trpc.user.getPublicById.useQuery({ id: id ?? "" }, { enabled: !!id });

	const { data: gameAccounts, isLoading: isLoadingAccounts } =
		trpc.gameAccount.getGameAccountsByUserId.useQuery(
			{ userId: id ?? "" },
			{ enabled: !!id },
		);

	if (!id) {
		return null;
	}

	if (isLoadingUser || isLoadingAccounts) {
		return (
			<>
				<Stack.Screen options={{ title: "Player" }} />
				<View className="flex-1 items-center justify-center bg-background">
					<ActivityIndicator />
				</View>
			</>
		);
	}

	if (isUserError || !publicUser) {
		return (
			<>
				<Stack.Screen options={{ title: "Player" }} />
				<Screen safeAreaEdges={["bottom", "left", "right"]}>
					<Text className="text-center font-sans text-text">
						Player not found.
					</Text>
				</Screen>
			</>
		);
	}

	const isOwnProfile = session?.user.id === publicUser.id;

	return (
		<Screen safeAreaEdges={["bottom", "left", "right"]}>
			<Stack.Screen options={{ title: "Player" }} />
			<ProfileScreen
				user={toProfileUser(publicUser)}
				isOwnProfile={isOwnProfile}
				gameAccounts={[
					...(gameAccounts?.lol ?? []),
					...(gameAccounts?.faceit ?? []),
				]}
			/>
		</Screen>
	);
}
