import LinkedAccountCard from "@/src/app/(protected)/(settings)/LinkedAccountCard";
import { GameAccount } from "@repo/types";
import { Text, View } from "react-native";

export default function LinkedAccountsList({
	linkedAccounts,
}: {
	linkedAccounts: GameAccount[];
}) {
	return (
		<View className="flex flex-col gap-3">
			{linkedAccounts.map((linkedAccount) => (
				<LinkedAccountCard
					key={linkedAccount.id}
					linkedAccount={linkedAccount}
				/>
			))}
		</View>
	);
}
