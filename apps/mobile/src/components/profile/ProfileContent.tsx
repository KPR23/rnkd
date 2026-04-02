import ConnectedAccounts from "@/src/components/profile/ConnectedAccounts";
import Tabs from "@/src/components/Tabs";
import type { GameAccount } from "@repo/types";
import { Text, View } from "react-native";
interface ProfileContentProps {
	gameAccounts: GameAccount[] | undefined;
}

export default function ProfileContent({ gameAccounts }: ProfileContentProps) {
	return (
		<View className="flex gap-8">
			<Tabs gameAccounts={gameAccounts ?? []} />
			<View className="flex flex-col gap-4">
				<Text className="font-sans-semibold text-xs text-text uppercase">
					Connected accounts
				</Text>
				<ConnectedAccounts gameAccounts={gameAccounts ?? []} />
			</View>
		</View>
	);
}
