import { Button } from "react-native";
import { router } from "expo-router";
import { authClient } from "../lib/auth-client";

export default function SocialSignIn() {
	const handleLogin = async () => {
		const result = await authClient.signIn.social({
			provider: "github",
			callbackURL: "/",
		});
		if ("error" in result) {
			// handle error
			return;
		}
		router.replace("/");
	};
	return <Button title="Login with Github" onPress={handleLogin} />;
}
