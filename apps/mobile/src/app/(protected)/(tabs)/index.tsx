import { ActivityIndicator, Button, Text, TextInput, View } from "react-native";

import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

export default function HomeTab() {
  const { data: session, isPending } = useAuth();
  const user = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !!session,
  });

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <View className="bg-background flex-1 items-center justify-center px-6">
      <Text className="font-sans-semibold mb-2 text-2xl text-white">Rnkd</Text>
      <Text className="text-center font-sans text-slate-200">
        Logged in as {user.data?.name}
      </Text>
    </View>
  );
}
