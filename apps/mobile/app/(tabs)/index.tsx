import { View, Text, Alert, Button } from "react-native";
import { trpc } from "../../utils/trpc";
import { authClient } from "../../lib/auth-client";

export default function HomeTab() {
	const { data: session } = authClient.useSession();
	const user = trpc.user.getCurrentUser.useQuery();

	if (!session) {
		const handleLogin = async () => {
			try {
				const result = await authClient.signIn.social({
					provider: "github",
					callbackURL: "mobile://",
				});
				console.log("LOGIN RESULT", JSON.stringify(result));

				if (result.error) {
					Alert.alert(
						"Sign in failed",
						result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
					);
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				console.error("LOGIN EXCEPTION", error);
				Alert.alert("Sign in exception", message);
			}
		};

		return (
			<View className="flex-1 items-center justify-center bg-[#131013] px-6">
				<Text className="mb-4 text-center text-base text-slate-100">
					You must be signed in to view this page
				</Text>
				<Button title="Login with Github" onPress={handleLogin} />
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center bg-[#131013] px-6">
			<Text className="mb-2 text-2xl font-semibold text-white">Rnkd</Text>
			<Text className="text-center text-slate-200">
				{JSON.stringify(user.data)}
			</Text>
		</View>
	);
}

const styles = {};
