import { User } from "@repo/types";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { Image, Text, View } from "react-native";

interface UserProfileImageProps {
	user: User;
	size?: number;
}

export default function UserProfileImage({
	user,
	size = 64,
}: UserProfileImageProps) {
	return user.image ? (
		<Image
			source={{ uri: user.image }}
			className="w-full h-full rounded-full"
			resizeMode="cover"
			style={{ width: size, height: size }}
		/>
	) : (
		<View
			className="rounded-full bg-dark flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<Text className="text-text text-xl font-mono-medium">
				{getInitialsForFallbackPhoto(user.name)}
			</Text>
		</View>
	);
}
