import { Button, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";

export default function SignInScreen() {
  const router = useRouter();
  const { data: session } = useAuth();
  const { showError } = useMessage();

  const handleLogin = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (result.error) {
        showError(
          result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("LOGIN EXCEPTION", error);
      showError(message);
    }
  };

  if (session) {
    router.replace("/(protected)/(tabs)");
  }

  return (
    <View className="bg-background flex-1 items-center justify-center px-6">
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
