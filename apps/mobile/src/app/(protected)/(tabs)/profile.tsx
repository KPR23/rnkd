import Screen from "@/src/components/Screen";
import ProfileScreen from "@/src/components/profile/ProfileScreen";
import { authClient } from "@/src/lib/auth-client";
import { trpc } from "@/src/utils/trpc";
import { useRouter } from "expo-router";
import { ExportIcon, GearSixIcon } from "phosphor-react-native";

export default function ProfileTab() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { data: gameAccounts } = trpc.gameAccount.getGameAccounts.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	if (!session) {
		return null;
	}

	return (
		<Screen>
			<ProfileScreen
				user={session.user}
				isOwnProfile
				gameAccounts={[
					...(gameAccounts?.lol ?? []),
					...(gameAccounts?.faceit ?? []),
				]}
				actions={[
					{
						icon: <ExportIcon size={22} color="white" />,
						onPress: () => void 0,
						accessibilityLabel: "Share",
					},
					{
						icon: <GearSixIcon size={22} color="white" />,
						onPress: () => router.push("/settings"),
						accessibilityLabel: "Settings",
					},
				]}
			/>
		</Screen>
	);
}
