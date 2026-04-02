import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children }: PropsWithChildren) {
	return (
		<View className="flex-1 bg-background">
			<SafeAreaView style={{ flex: 1 }} edges={["top"]}>
				<View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
			</SafeAreaView>
		</View>
	);
}
