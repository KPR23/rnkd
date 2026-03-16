import { Touchable, TouchableHighlight, View } from "react-native";
import Text from "../components/Text";
import { authClient } from "../../lib/auth-client";
import Screen from "../components/Screen";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

export default function ProfileTab() {
	const { data: session } = authClient.useSession();

	if (!session) {
		return (
			<Screen>
				<Text className="will-change-variable text-3xl font-semibold text-text">
					PROFILE
				</Text>
				<Text className="will-change-variable mt-2 text-base text-text text-center">
					Zaloguj się, aby zobaczyć profil
				</Text>
			</Screen>
		);
	}

	return (
		<Screen>
			<View className="flex-row items-start mt-4 justify-between">
				<Text className="will-change-variable text-[24px] font-bold text-text">
					Profile
				</Text>
				<TouchableHighlight onPress={() => router.push("/settings")}>
					<MaterialCommunityIcons name="cog" size={28} color={"#f5f2f5"} />
				</TouchableHighlight>
			</View>
		</Screen>
	);
}
