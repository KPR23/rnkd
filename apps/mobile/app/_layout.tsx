import { Stack } from "expo-router";
import { TRPCProvider } from "../utils/provider";

export default function Layout() {
	return (
		<TRPCProvider>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</TRPCProvider>
	);
}
