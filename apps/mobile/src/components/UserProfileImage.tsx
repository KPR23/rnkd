import { Image, Text, View } from "react-native";

import { User } from "@repo/types";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";

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
      className="h-full w-full rounded-full"
      resizeMode="cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <View
      className="bg-dark flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <Text className="text-text font-mono-medium text-xl">
        {getInitialsForFallbackPhoto(user.name)}
      </Text>
    </View>
  );
}
