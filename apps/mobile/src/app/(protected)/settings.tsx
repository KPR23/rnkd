import Screen from "@/src/components/Screen";
import { authClient } from "@/src/lib/auth/auth-client";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native";

export default function SettingsScreen() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.replace("/(auth)/sign-in");
	};

	return (
		<Screen>
			<Text className="text-text">settings</Text>
			<Button title="Sign Out" onPress={handleSignOut} />
		</Screen>
	);
}
