import { colors } from "@repo/ui/colors";
import { Stack } from "expo-router";
import { XIcon } from "phosphor-react-native";
import { PropsWithChildren, ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomModal({
	children,
	visible,
	onClose,
	title,
	footer,
}: PropsWithChildren<{
	visible: boolean;
	onClose: () => void;
	title: string;
	footer?: ReactNode;
}>) {
	return (
		<Modal
			visible={visible}
			onRequestClose={onClose}
			presentationStyle="pageSheet"
			animationType="slide"
		>
			<Stack.Screen options={{ title }} />
			<View className="flex-1 bg-sheet">
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
				>
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
								paddingBottom: 24,
							}}
						>
							{children}
						</ScrollView>
						{footer ? (
							<View className="border-t border-border px-5 py-4 bg-sheet">
								{footer}
							</View>
						) : null}
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}
