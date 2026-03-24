import type { GameAccount } from "@repo/types";
import { View } from "react-native";
import Tabs from "@/app/components/Tabs";
interface ProfileContentProps {
	gameAccounts: GameAccount[] | undefined;
}

export default function ProfileContent({ gameAccounts }: ProfileContentProps) {
	return (
		<View className="">
			<Tabs gameAccounts={gameAccounts ?? []} />
		</View>
	);
}
