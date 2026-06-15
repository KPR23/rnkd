import { Text, View } from "react-native";

import { User } from "@repo/types";
import Frame from "@/src/components/Frame";
import UserProfileImage from "@/src/components/UserProfileImage";

export default function UserHeader({ user }: { user: User }) {
  return (
    <Frame className="flex-row gap-3! p-4!">
      <UserProfileImage user={user} size={48} />
      <View className="flex-1">
        <Text className="text-text text-xl font-medium">{user.name}</Text>
        <Text className="text-sm text-gray-500">{user.email}</Text>
      </View>
    </Frame>
  );
}
