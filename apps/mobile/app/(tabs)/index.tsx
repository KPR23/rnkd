import { View, Text, StyleSheet, Alert, Button } from "react-native";
import { trpc } from "../../utils/trpc";
import { authClient } from "../../lib/auth-client";

export default function HomeTab() {
	const user = trpc.user.getCurrentUser.useQuery();

	const { data: session, isPending } = authClient.useSession();

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
			<Text style={styles.userText}>{JSON.stringify(user.data)}</Text>
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
	form: {
		marginTop: 24,
		alignSelf: "stretch",
		padding: 16,
		backgroundColor: "#f3f4f6",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	formTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 12,
	},
	label: {
		fontSize: 14,
		color: "#374151",
		marginBottom: 6,
	},
	regionRow: {
		marginBottom: 10,
	},
	regionChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "#e5e7eb",
		marginRight: 8,
	},
	regionChipActive: {
		backgroundColor: "#2563eb",
	},
	regionChipText: {
		fontSize: 14,
		color: "#374151",
	},
	regionChipTextActive: {
		color: "#fff",
	},
	input: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#d1d5db",
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		fontSize: 16,
		color: "#111827",
	},
	submitBtn: {
		backgroundColor: "#2563eb",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 4,
	},
	submitBtnDisabled: {
		opacity: 0.6,
	},
	submitBtnText: {
		color: "#fff",
		fontWeight: "500",
		fontSize: 16,
	},
});
