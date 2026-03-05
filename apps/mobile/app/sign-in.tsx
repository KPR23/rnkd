import { Alert, Button, Linking } from "react-native";
import { router } from "expo-router";
import { authClient } from "../lib/auth-client";

export default function SocialSignIn() {
	const handleLogin = async () => {
		const result = await authClient.signIn.social({
			provider: "github",
			callbackURL: "/",
		});
		if (result.error) {
			Alert.alert(
				"Sign in failed",
				result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
			);
			return;
		}

		if (result.data?.redirect && result.data.url) {
			await Linking.openURL(result.data.url);
		}

		router.replace("/");
	};
	return <Button title="Login with Github" onPress={handleLogin} />;
}
