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
	const hello = trpc.hello.useQuery({ name: "Test" });

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Rnkd test</Text>
			<Text>{hello.data?.greeting ?? "Loading..."}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#4F46E5",
		alignItems: "center",
		justifyContent: "center",
	},
});
