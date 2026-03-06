import {
	ActivityIndicator,
	Alert,
	Button,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { trpc } from "../utils/trpc";
import { authClient } from "../lib/auth-client";

function UsersList() {
	const users = trpc.getUsers.useQuery();

	return (
		<View style={styles.usersList}>
			<Text style={styles.sectionTitle}>Users List:</Text>
			{users.data?.map((user) => (
				<Text key={user.id} style={styles.userText}>
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
			<View style={styles.centeredScreen}>
				<ActivityIndicator />
			</View>
		);
	}

	if (!session) {
		const handleLogin = async () => {
			try {
				const result = await authClient.signIn.social({
					provider: "github",
					callbackURL: "mobile://",
				});
				console.log("LOGIN RESULT", JSON.stringify(result));

				if (result.error) {
					Alert.alert(
						"Sign in failed",
						result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
					);
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				console.error("LOGIN EXCEPTION", error);
				Alert.alert("Sign in exception", message);
			}
		};

		return (
			<View style={styles.centeredScreen}>
				<Text style={styles.messageText}>
					You must be signed in to view this page
				</Text>
				<Button title="Login with Github" onPress={handleLogin} />
			</View>
		);
	}

	return (
		<View style={styles.centeredScreen}>
			<Text style={styles.title}>Rnkd</Text>
			<UsersList />
		</View>
	);
}

const styles = StyleSheet.create({
	centeredScreen: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f7f7f2",
		paddingHorizontal: 24,
	},
	messageText: {
		marginBottom: 16,
		color: "#111827",
		textAlign: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: "#111827",
	},
	usersList: {
		marginTop: 20,
		alignSelf: "stretch",
	},
	sectionTitle: {
		fontWeight: "bold",
		marginBottom: 10,
		color: "#111827",
		textAlign: "center",
	},
	userText: {
		color: "#111827",
		textAlign: "center",
	},
});
