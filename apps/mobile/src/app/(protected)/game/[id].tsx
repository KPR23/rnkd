import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import { trpc } from "@/src/utils/trpc";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function GameDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	const {
		data: game,
		isLoading,
		isError,
	} = trpc.game.getById.useQuery({ id: id ?? "" }, { enabled: !!id });

	if (!id) {
		return null;
	}

	if (isLoading) {
		return (
			<>
				<Stack.Screen options={{ title: "Game" }} />
				<View className="flex-1 items-center justify-center bg-background">
					<ActivityIndicator />
				</View>
			</>
		);
	}

	if (isError || !game) {
		return (
			<Screen safeAreaEdges={["bottom", "left", "right"]}>
				<Stack.Screen options={{ title: "Game" }} />
				<ScreenTitle title="Game" />
				<Text className="mt-4 text-center font-sans text-text">
					Game not found.
				</Text>
			</Screen>
		);
	}

	return (
		<Screen safeAreaEdges={["bottom", "left", "right"]}>
			<Stack.Screen options={{ title: game.name }} />
			<ScreenTitle title={game.name} />
		</Screen>
	);
}
