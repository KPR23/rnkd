import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";
import { ActivityIndicator, Text, View } from "react-native";

export default function HomeTab() {
	const { data: session, isPending } = useAuth();
	const user = trpc.user.getCurrentUser.useQuery(undefined, {
		enabled: !!session,
	});

	if (isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator />
			</View>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Text className="mb-2 text-2xl font-sans-semibold text-white">Rnkd</Text>
			<Text className="text-center font-sans text-slate-200">
				{JSON.stringify(user.data)}
			</Text>
		</View>
	);
}
