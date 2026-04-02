import Frame from "@/src/components/Frame";
import UserProfileImage from "@/src/components/UserProfileImage";
import { User } from "@repo/types";
import { Text, View } from "react-native";

export default function UserHeader({ user }: { user: User }) {
	return (
		<Frame className="flex-row gap-3!">
			<UserProfileImage user={user} size={48} />
			<View className="flex-1">
				<Text className="text-xl font-bold text-text">{user.name}</Text>
				<Text className="text-sm text-gray-500">{user.email}</Text>
			</View>
		</Frame>
	);
}
