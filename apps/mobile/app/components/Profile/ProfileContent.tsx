import type { GameAccount } from "@repo/types";
import { Text, View } from "react-native";
import Tabs from "@/app/components/Tabs";
import ConnectedAccounts from "@/app/components/Profile/ConnectedAccounts";
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
