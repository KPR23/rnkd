import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";

import { User } from "@repo/types";
import { getInitialsForFallbackPhoto } from "@repo/ui/components/getInitialsForFallbackPhoto";
import { resolveProfileImageUrl } from "@/src/lib/profile/resolve-profile-image-url";

interface UserProfileImageProps {
  user: User;
  size?: number;
}

export default function UserProfileImage({
  user,
  size = 64,
}: UserProfileImageProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUri = resolveProfileImageUrl(user.image);
  const showImage = Boolean(imageUri) && !hasImageError;

  useEffect(() => {
    setHasImageError(false);
  }, [user.image]);

  return showImage ? (
    <Image
      source={{ uri: imageUri ?? undefined }}
      className="h-full w-full rounded-full"
      resizeMode="cover"
      style={{ width: size, height: size }}
      onError={() => setHasImageError(true)}
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
