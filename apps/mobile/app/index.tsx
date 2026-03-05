import { ActivityIndicator, Button, Text, View } from "react-native";
import { trpc } from "../utils/trpc";
import { authClient } from "../lib/auth-client";

function UsersList() {
	const users = trpc.getUsers.useQuery();

	return (
		<View style={{ marginTop: 20 }}>
			<Text style={{ fontWeight: "bold", marginBottom: 10 }}>Users List:</Text>
			{users.data?.map((user) => (
				<Text key={user.id}>
					{user.name} ({user.email})
				</Text>
			))}
		</View>
	);
}

export default function Index() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator />
			</View>
		);
	}

	if (!session) {
		const handleLogin = async () => {
			const { error } = await authClient.signIn.social({
				provider: "github",
				callbackURL: "/",
			});
			if (error) {
				// handle error if needed
				return;
			}
		};

		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ marginBottom: 16 }}>
					You must be signed in to view this page
				</Text>
				<Button title="Login with Github" onPress={handleLogin} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Rnkd test</Text>
			<UsersList />
		</View>
	);
}
