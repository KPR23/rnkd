import Button from "@/app/components/Button";
import Screen from "@/app/components/Screen";
import ScreenTitle from "@/app/components/ScreenTitle";
import Text from "@/app/components/Text";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { ExportIcon, GearSixIcon } from "phosphor-react-native";
import { Image, View } from "react-native";
import Frame from "../components/Frame";
import ProfileContent from "../components/Profile/ProfileContent";

export default function ProfileTab() {
	const { data: session } = authClient.useSession();
	const { data: gameAccounts } = trpc.gameAccount.getGameAccounts.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	if (!session) {
		return (
			<Screen>
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
			<Frame className="mt-4">
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
			</Frame>

			<ProfileContent
				user={session.user}
				gameAccounts={[
					...(gameAccounts?.lol ?? []),
					...(gameAccounts?.faceit ?? []),
				]}
			/>
		</Screen>
	);
}
