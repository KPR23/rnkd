import {
	ActivityIndicator,
	Alert,
	Button,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import {
	useAddLolAccountForm,
	useAddFaceitAccountForm,
	RIOT_REGIONS,
	RIOT_REGION_LABELS,
} from "@repo/forms";
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

function AddLolAccountForm() {
	const addLol = trpc.gameAccount.addLolAccount.useMutation({
		onSuccess: () => Alert.alert("Success", "LoL account added."),
		onError: (err) => Alert.alert("Error", err.message),
	});
	const form = useAddLolAccountForm(addLol);

	const handleSubmit = () => {
		if (!form.isValid) {
			Alert.alert(
				"Error",
				"Game name: 3-16 characters, Tag line: 3-5 characters (e.g. EUW1).",
			);
			return;
		}
		form.handleSubmit();
	};

	return (
		<View style={styles.form}>
			<Text style={styles.formTitle}>Add League of Legends account</Text>
			<TextInput
				placeholder="Game name (e.g. PlayerName)"
				value={form.gameName}
				onChangeText={form.setGameName}
				style={styles.input}
				placeholderTextColor="#6b7280"
				autoCapitalize="none"
			/>
			<TextInput
				placeholder="Tag line (e.g. EUW1)"
				value={form.tagLine}
				onChangeText={form.setTagLine}
				style={styles.input}
				placeholderTextColor="#6b7280"
				autoCapitalize="characters"
			/>
			<Text style={styles.label}>Region</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.regionRow}
			>
				{RIOT_REGIONS.map((r) => (
					<TouchableOpacity
						key={r}
						style={[
							styles.regionChip,
							form.region === r && styles.regionChipActive,
						]}
						onPress={() => form.setRegion(r)}
					>
						<Text
							style={[
								styles.regionChipText,
								form.region === r && styles.regionChipTextActive,
							]}
						>
							{RIOT_REGION_LABELS[r]}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
			<TouchableOpacity
				style={[styles.submitBtn, form.isPending && styles.submitBtnDisabled]}
				onPress={handleSubmit}
				disabled={form.isPending}
			>
				<Text style={styles.submitBtnText}>
					{form.isPending ? "Saving…" : "Add LoL account"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

function AddFaceitAccountForm() {
	const addFaceit = trpc.gameAccount.addFaceitAccount.useMutation({
		onSuccess: () => Alert.alert("Success", "Faceit account added."),
		onError: (err) => Alert.alert("Error", err.message),
	});
	const form = useAddFaceitAccountForm(addFaceit);

	const handleSubmit = () => {
		if (!form.isValid) {
			Alert.alert("Error", "Enter Faceit ID.");
			return;
		}
		form.handleSubmit();
	};

	return (
		<View style={styles.form}>
			<Text style={styles.formTitle}>Add CS2 Faceit account</Text>
			<TextInput
				placeholder="Faceit ID (e.g. from faceit.com)"
				value={form.externalId}
				onChangeText={form.setExternalId}
				style={styles.input}
				placeholderTextColor="#6b7280"
				autoCapitalize="none"
			/>
			<TouchableOpacity
				style={[styles.submitBtn, form.isPending && styles.submitBtnDisabled]}
				onPress={handleSubmit}
				disabled={form.isPending}
			>
				<Text style={styles.submitBtnText}>
					{form.isPending ? "Saving…" : "Add Faceit account"}
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
			<AddLolAccountForm />
			<AddFaceitAccountForm />
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
