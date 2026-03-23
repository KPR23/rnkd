import Screen from "@/app/components/Screen";
import Text from "@/app/components/Text";
import ProfileScreen from "@/app/components/Profile/ProfileScreen";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { ExportIcon, GearSixIcon } from "phosphor-react-native";

export default function ProfileTab() {
	const { data: session } = authClient.useSession();
	const { data: gameAccounts } = trpc.gameAccount.getGameAccounts.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	if (!session) {
		return (
			<Screen>
				<Text className="mt-2 text-base text-white text-center">
					Zaloguj się, aby zobaczyć profil
				</Text>
			</Screen>
		);
	}

	return (
		<Screen>
			<ProfileScreen
				user={session.user}
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
						onPress: () => void 0,
						accessibilityLabel: "Settings",
					},
				]}
			/>
		</Screen>
	);
}
