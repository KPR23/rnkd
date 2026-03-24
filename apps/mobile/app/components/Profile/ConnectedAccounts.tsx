import { View, Text } from "react-native";
import type { GameAccount } from "@repo/types";
import ConnectedAccountCard from "@/app/components/Profile/ConnectedAccountCard";

export default function ConnectedAccounts({
	gameAccounts,
}: {
	gameAccounts: GameAccount[];
}) {
	return (
		<View className="flex flex-col">
			{gameAccounts.map((gameAccount) => (
				<ConnectedAccountCard key={gameAccount.id} gameAccount={gameAccount} />
			))}
		</View>
	);
}
