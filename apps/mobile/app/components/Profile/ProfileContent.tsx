import type { GameAccount, User } from "@repo/types";
import { View } from "react-native";
import Tabs from "../Tabs";
interface ProfileContentProps {
	user: User | null;
	gameAccounts: GameAccount[] | undefined;
}

export default function ProfileContent({
	user,
	gameAccounts,
}: ProfileContentProps) {
	return (
		<View className="">
			<Tabs gameAccounts={gameAccounts ?? []} />
		</View>
	);
}
