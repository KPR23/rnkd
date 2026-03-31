import Frame from "@/app/components/Frame";
import { DRAGON_CDN_VERSION } from "@/constants/riotApiUrl";
import { GameAccount, isLolGameAccount } from "@repo/types";
import { XIcon } from "phosphor-react-native";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountDetailsModal({
	gameAccount,
	visible,
	onClose,
}: {
	gameAccount: GameAccount;
	visible: boolean;
	onClose: () => void;
}) {
	return (
		<Modal
			visible={visible}
			onRequestClose={onClose}
			presentationStyle="pageSheet"
			animationType="slide"
		>
			<View className="flex-1 bg-card">
				<SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
					<View className="px-6 py-4 flex flex-row items-center justify-between">
						<Text className="text-text text-lg font-sans-bold">
							Account Details
						</Text>
						<Pressable onPress={onClose}>
							<XIcon size={24} color="#5b5666" weight="bold" />
						</Pressable>
					</View>
					{gameAccount && (
						<ScrollView
							className="flex-1"
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{
								paddingHorizontal: 20,
								paddingTop: 8,
								paddingBottom: 32,
							}}
						>
							{isLolGameAccount(gameAccount) ? (
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
							) : (
								<View className="flex flex-col gap-3">
									<View>
										<Text className="font-mono-medium text-xs uppercase text-text-secondary">
											Faceit
										</Text>
										<Text
											className="font-sans-semibold text-base text-text"
											numberOfLines={1}
										>
											{gameAccount.profile?.faceitNickname?.trim() ||
												gameAccount.externalId}
										</Text>
									</View>
									{gameAccount.profile?.steamNickname?.trim() ? (
										<View>
											<Text className="font-mono-medium text-xs uppercase text-text-secondary">
												Steam
											</Text>
											<Text
												className="font-sans-semibold text-sm text-text-secondary"
												numberOfLines={1}
											>
												{gameAccount.profile.steamNickname.trim()}
											</Text>
										</View>
									) : null}
								</View>
							)}
						</ScrollView>
					)}
				</SafeAreaView>
			</View>
		</Modal>
	);
}
