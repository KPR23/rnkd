import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { TRPCProvider } from "./utils/provider";
import Index from "./app/index";

export default function App() {
	return (
		<TRPCProvider>
			<View style={styles.container}>
				<Index />
				<StatusBar style="auto" />
			</View>
		</TRPCProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f999",
		alignItems: "center",
		justifyContent: "center",
	},
});
