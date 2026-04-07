import Screen from "@/src/components/Screen";
import ProfileScreen from "@/src/components/profile/ProfileScreen";
import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { ExportIcon, GearSixIcon } from "phosphor-react-native";

export default function ProfileTab() {
	const router = useRouter();
	const { data: session, isPending } = useAuth();
	const { data: gameAccounts } = trpc.gameAccount.getGameAccounts.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	if (isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator />
			</View>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<Screen>
			<ProfileScreen
				user={session.user}
				isOwnProfile
				title="Profile"
				gameAccounts={[
					...(gameAccounts?.lol ?? []),
					...(gameAccounts?.faceit ?? []),
				]}
				actions={[
					{
						icon: <ExportIcon />,
						onPress: () => void 0,
						accessibilityLabel: "Share",
					},
					{
						icon: <GearSixIcon />,
						onPress: () => router.push("/settings"),
						accessibilityLabel: "Settings",
					},
				]}
			/>
		</Screen>
	);
}
