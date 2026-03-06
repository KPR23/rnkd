import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { TRPCProvider } from "../utils/provider";

export default function RootLayout() {
	return (
		<TRPCProvider>
			<View style={styles.container}>
				<Slot />
				<StatusBar style="auto" />
			</View>
		</TRPCProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f7f7f2",
	},
});
