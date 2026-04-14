import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { XIcon } from "phosphor-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  GameAccount,
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import Cs2FaceitAccountDetailsModal from "@/src/components/profile/Cs2FaceitAccountDetailsModal";
import LolAccountDetailsModal from "@/src/components/profile/LolAccountDetailsModal";

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
      <View className="bg-card flex-1">
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View className="flex flex-row items-center justify-between px-6 py-4">
            <Text className="text-text font-sans-bold text-lg">
              Account Details
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <XIcon size={24} color={colors.textMuted} weight="bold" />
            </TouchableOpacity>
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
