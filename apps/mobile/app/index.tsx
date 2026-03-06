import {
	ActivityIndicator,
	Alert,
	Button,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { ADD_GAME_ACCOUNT_FIELDS, useAddGameAccountForm } from "@repo/forms";
import { trpc } from "../utils/trpc";
import { authClient } from "../lib/auth-client";

function UsersList() {
	const user = trpc.user.getCurrentUser.useQuery();

	return (
		<View style={styles.usersList}>
			<Text style={styles.sectionTitle}>User:</Text>
			<Text style={styles.userText}>
				{user.data?.name} ({user.data?.email})
			</Text>
		</View>
	);
}

function AddGameAccountForm() {
	const addAccount = trpc.gameAccount.addGameAccount.useMutation({
		onSuccess: () => Alert.alert("Sukces", "Konto dodane."),
		onError: (err) => Alert.alert("Błąd", err.message),
	});
	const form = useAddGameAccountForm(addAccount);

	const handleSubmit = () => {
		if (
			!form.gameId.trim() ||
			!form.externalId.trim() ||
			!form.nickname.trim() ||
			!form.region.trim()
		) {
			Alert.alert("Błąd", "Wypełnij wszystkie pola.");
			return;
		}
		form.handleSubmit();
	};

	return (
		<View style={styles.form}>
			<Text style={styles.formTitle}>Dodaj konto gry</Text>
			{(
				ADD_GAME_ACCOUNT_FIELDS as readonly {
					key: string;
					placeholder: string;
				}[]
			).map((field) => (
				<TextInput
					key={field.key}
					placeholder={field.placeholder}
					value={form[field.key as keyof typeof form] as string}
					onChangeText={(v) => {
						const setter =
							form[
								`set${field.key.charAt(0).toUpperCase()}${field.key.slice(1)}` as keyof typeof form
							];
						if (typeof setter === "function")
							(setter as (v: string) => void)(v);
					}}
					style={styles.input}
					placeholderTextColor="#6b7280"
				/>
			))}
			<TouchableOpacity
				style={[styles.submitBtn, form.isPending && styles.submitBtnDisabled]}
				onPress={handleSubmit}
				disabled={form.isPending}
			>
				<Text style={styles.submitBtnText}>
					{form.isPending ? "Zapisywanie…" : "Dodaj konto"}
				</Text>
			</TouchableOpacity>
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
			<AddGameAccountForm />
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
