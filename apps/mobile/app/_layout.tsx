import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { TRPCProvider } from "../utils/provider";

export default function RootLayout() {
	return (
		<TRPCProvider>
			<View style={{ flex: 1 }}>
				<Slot />
				<StatusBar style="auto" />
			</View>
		</TRPCProvider>
	);
}
