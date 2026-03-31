import Frame from "@/app/components/Frame";
import { DRAGON_CDN_VERSION } from "@/constants/riotApiUrl";
import { LolGameAccount } from "@repo/types";
import { Image, Text, View } from "react-native";

export default function LolAccountDetailsModal({
	gameAccount,
}: {
	gameAccount: LolGameAccount;
}) {
	return (
		<Frame className="flex flex-row items-center justify-start gap-3">
			<Image
				source={{
					uri: `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`,
				}}
				className="w-14 h-14 rounded-full"
			/>
			<View className="flex flex-col ">
				<View className="flex flex-row gap-1 items-center">
					<Text className="text-text text-xl font-sans-semibold">
						{gameAccount.profile.gameName}
					</Text>
					<Text className="text-text-muted text-lg font-sans-semibold">
						#{gameAccount.profile.tagLine}
					</Text>
				</View>
				<Text className="text-text-muted text-sm font-sans-medium">
					Level {gameAccount.profile.summonerLevel}
				</Text>
			</View>
		</Frame>
	);
}
