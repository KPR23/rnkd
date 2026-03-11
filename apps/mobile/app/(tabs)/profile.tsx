import { View, Text, StyleSheet } from "react-native";
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
			<View style={styles.container}>
				<Text>Zaloguj się, aby zobaczyć profil</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
