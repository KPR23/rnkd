import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { TRPCProvider } from "./utils/provider";
import { trpc } from "./utils/trpc";

export default function App() {
	return (
		<TRPCProvider>
			<View style={styles.container}>
				<MyScreen />
				<StatusBar style="auto" />
			</View>
		</TRPCProvider>
	);
}

function MyScreen() {
	// Testowanie type-safety
	const users = trpc.getUsers.useQuery();

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Rnkd test</Text>

			<View style={{ marginTop: 20 }}>
				<Text style={{ fontWeight: "bold", marginBottom: 10 }}>
					Users List:
				</Text>
				{users.data?.map((user) => (
					<Text key={user.id}>
						{user.name} ({user.email})
					</Text>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
