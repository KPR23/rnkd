import { View } from "react-native";
import { Game, User } from "@repo/types";
import Tabs from "../Tabs";

export type GameType = Omit<Game, "createdAt" | "updatedAt">;

interface ProfileContentProps {
	user: User | null;
	games: GameType[];
}

export default function ProfileContent({ user, games }: ProfileContentProps) {
	return (
		<View className="mt-8">
			<Tabs games={games} />
		</View>
	);
}
