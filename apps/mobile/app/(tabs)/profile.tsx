import { router } from "expo-router";
import { ExportIcon, GearSixIcon } from "phosphor-react-native";
import { Image, TouchableHighlight, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import Screen from "@/app/components/Screen";
import ScreenTitle from "@/app/components/ScreenTitle";
import Text from "@/app/components/Text";
import Button from "@/app/components/Button";

export default function ProfileTab() {
	const { data: session } = authClient.useSession();

	if (!session) {
		return (
			<Screen>
				<Text className="text-2xl font-bold text-white">PROFILE</Text>
				<TouchableHighlight
					onPress={() => router.push("/settings")}
					className="p-2 border w-9 h-9 items-center justify-center border-[#29262A]"
				>
					<ExportIcon size={20} color={"white"} />
				</TouchableHighlight>
				<Text className="mt-2 text-base text-white text-center">
					Zaloguj się, aby zobaczyć profil
				</Text>
			</Screen>
		);
	}

	return (
		<Screen>
			<ScreenTitle
				title="Profile"
				actions={[
					{
						icon: <ExportIcon size={22} color="white" />,
						onPress: () => void 0,
						accessibilityLabel: "Share",
					},
					{
						icon: <GearSixIcon size={22} color="white" />,
						onPress: () => void 0,
						accessibilityLabel: "Settings",
					},
				]}
			/>

			<View className="border-dark flex-col gap-5 items-center justify-center border mt-4 p-5">
				<View className="flex items-center gap-2">
					<Image
						source={{ uri: session.user.image ?? "" }}
						className="w-full h-full rounded-full"
						resizeMode="cover"
						style={{ width: 64, height: 64 }}
					/>
					<View className="flex flex-col items-center gap-1 text-center">
						<Text className="text-2xl font-bold text-text">
							{session.user.name}
						</Text>
						{session.user.tag && (
							<Text
								className="text-primary"
								style={{ fontFamily: "JetBrainsMono_700Bold" }}
							>
								@{session.user.tag}
							</Text>
						)}
					</View>
				</View>
				<View className="w-full flex-row gap-3">
					<Button
						variant="primary"
						actionText="Add friend"
						className="flex-1"
						onPress={() => void 0}
					/>
					<Button
						variant="secondary"
						actionText="Message"
						className="flex-1"
						onPress={() => void 0}
					/>
				</View>
			</View>
		</Screen>
	);
}
