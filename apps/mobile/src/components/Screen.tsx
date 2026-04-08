import { PropsWithChildren } from "react";
import { View } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

const defaultSafeAreaEdges: Edge[] = ["top"];

export type ScreenProps = PropsWithChildren<{
	safeAreaEdges?: Edge[];
}>;

export default function Screen({
	children,
	safeAreaEdges = defaultSafeAreaEdges,
}: ScreenProps) {
	return (
		<View className="flex-1 bg-background">
			<SafeAreaView style={{ flex: 1 }} edges={safeAreaEdges}>
				<View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
			</SafeAreaView>
		</View>
	);
}
