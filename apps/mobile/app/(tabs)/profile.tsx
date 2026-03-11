import { View, Text } from "react-native";
import { trpc } from "../../utils/trpc";
import { authClient } from "../../lib/auth-client";

export default function ProfileTab() {
	const { data: session } = authClient.useSession();
	const { data: gameAccountsData } = trpc.user.getGameAccounts.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	if (!session) {
		return (
			<View className="flex-1 items-center justify-center bg-[#131013]">
				<Text>Zaloguj się, aby zobaczyć profil</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center bg-[#131013]">
			<Text className="text-2xl font-semibold text-white">
				LOL:{" "}
				{gameAccountsData?.lol
					.map(
						(lol) => `${lol.gameName} #${lol.tagLine} (${lol.platformRoute})`,
					)
					.join(", ")}
			</Text>
		</View>
	);
}
