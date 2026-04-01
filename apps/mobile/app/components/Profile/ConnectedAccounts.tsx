import { View } from "react-native";
import type { GameAccount } from "@repo/types";
import ConnectedAccountCard from "@/app/components/profile/ConnectedAccountCard";

export default function ConnectedAccounts({
	gameAccounts,
}: {
	gameAccounts: GameAccount[];
}) {
	return (
		<View className="flex flex-col gap-4">
			{gameAccounts.map((gameAccount) => (
				<ConnectedAccountCard key={gameAccount.id} gameAccount={gameAccount} />
			))}
		</View>
	);
}
