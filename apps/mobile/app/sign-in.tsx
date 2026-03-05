import { Alert, Button } from "react-native";
import { router } from "expo-router";
import { authClient } from "../lib/auth-client";

export default function SocialSignIn() {
	const handleLogin = async () => {
		try {
			const result = await authClient.signIn.social({
				provider: "github",
				callbackURL: "mobile://",
			});
			if (result.error) {
				Alert.alert(
					"Sign in failed",
					result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
				);
				return;
			}
			router.replace("/");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("LOGIN EXCEPTION", error);
			Alert.alert("Sign in exception", message);
		}
	};
	return <Button title="Login with Github" onPress={handleLogin} />;
}
