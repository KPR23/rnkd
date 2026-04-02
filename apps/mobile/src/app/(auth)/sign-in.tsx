import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useRouter } from "expo-router";
import { Alert, Button, Text, View } from "react-native";

export default function SignInScreen() {
	const router = useRouter();
	const { data: session } = useAuth();

	const handleLogin = async () => {
		try {
			const result = await authClient.signIn.social({
				provider: "github",
				callbackURL: "/",
			});

			if (result.error) {
				Alert.alert(
					"Sign in failed",
					result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
				);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("LOGIN EXCEPTION", error);
			Alert.alert("Sign in exception", message);
		}
	};

	if (session) {
		router.replace("/(protected)/(tabs)");
	}

	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Text className="mb-2 text-center font-sans text-lg text-white">
				You are logged out
			</Text>
			<Text className="mb-6 text-center font-sans text-base text-slate-300">
				Sign in with GitHub to continue.
			</Text>
			<Button title="Login with GitHub" onPress={handleLogin} />
		</View>
	);
}
