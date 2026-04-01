import Cs2FaceitAccountDetailsModal from "@/app/components/profile/Cs2FaceitAccountDetailsModal";
import LolAccountDetailsModal from "@/app/components/profile/LolAccountDetailsModal";
import {
	GAMES,
	GameAccount,
	isCs2FaceitGameAccount,
	isLolGameAccount,
} from "@repo/types";
import { XIcon } from "phosphor-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AccountDetailsModalProps {
	gameAccount: GameAccount;
	visible: boolean;
	onClose: () => void;
}

function AccountDetailsContent({ gameAccount }: { gameAccount: GameAccount }) {
	switch (gameAccount.gameId) {
		case GAMES.LOL:
			if (!isLolGameAccount(gameAccount)) {
				return null;
			}
			return <LolAccountDetailsModal gameAccount={gameAccount} />;
		case GAMES.CS2_FACEIT:
			if (!isCs2FaceitGameAccount(gameAccount)) {
				return null;
			}
			return <Cs2FaceitAccountDetailsModal gameAccount={gameAccount} />;
		default:
			return null;
	}
}

export default function AccountDetailsModal({
	gameAccount,
	visible,
	onClose,
}: AccountDetailsModalProps) {
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
					<ScrollView
						className="flex-1"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingHorizontal: 20,
							paddingBottom: 32,
						}}
					>
						<AccountDetailsContent gameAccount={gameAccount} />
					</ScrollView>
				</SafeAreaView>
			</View>
		</Modal>
	);
}
