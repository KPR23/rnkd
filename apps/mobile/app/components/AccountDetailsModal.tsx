import { GameAccount } from "@repo/types";
import { XIcon } from "phosphor-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
					<View className="px-6 py-4 flex flex-row items-center justify-between border-b border-border">
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
							<Text className="text-text">
								{gameAccount.profile?.gameAccountId}
							</Text>
						</ScrollView>
					)}
				</SafeAreaView>
			</View>
		</Modal>
	);
}
