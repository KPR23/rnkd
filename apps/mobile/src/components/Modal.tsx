import { colors } from "@repo/ui/colors";
import { Stack } from "expo-router";
import { XIcon } from "phosphor-react-native";
import { PropsWithChildren } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomModal({
	children,
	visible,
	onClose,
	title,
}: PropsWithChildren<{
	visible: boolean;
	onClose: () => void;
	title: string;
}>) {
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
						<Text className="text-text text-lg font-sans-bold">{title}</Text>
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
						{children}
					</ScrollView>
				</SafeAreaView>
			</View>
		</Modal>
	);
}
