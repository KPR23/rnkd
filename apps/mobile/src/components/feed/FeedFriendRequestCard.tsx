import { Pressable, View } from "react-native";

import { useRouter } from "expo-router";

import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import UserProfileImage from "@/src/components/UserProfileImage";
import { formatFeedRelativeTime } from "@/src/lib/feed/feed-time";
import { formatUserDisplayName } from "@/src/lib/user/format-user-display-name";

import { toFeedUser } from "./feed-user";
import type { FeedPostAuthor } from "./FeedPostCard";

export type FeedFriendRequestCardData = {
  id: string;
  createdAt: Date;
  requester: FeedPostAuthor;
};

type Props = {
  request: FeedFriendRequestCardData;
  disabled?: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function FeedFriendRequestCard({
  request,
  disabled = false,
  onAccept,
  onDecline,
}: Props) {
  const router = useRouter();
  const createdAt =
    request.createdAt instanceof Date
      ? request.createdAt
      : new Date(request.createdAt);
  const relativeTime = formatFeedRelativeTime(createdAt);
  const requesterDisplayName = formatUserDisplayName(request.requester);

  return (
    <View className="border-muted bg-card gap-3.5 border py-4">
      <Pressable
        className="flex-row items-center gap-2.5 px-5"
        onPress={() => router.push(`/player/${request.requester.id}`)}
      >
        <View className="size-10 overflow-hidden rounded-full">
          <UserProfileImage user={toFeedUser(request.requester)} size={40} />
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-base leading-5" weight="medium">
            {requesterDisplayName}
          </AppText>
          <AppText className="text-sm leading-5" color="#828083">
            Friend request · {relativeTime}
          </AppText>
        </View>
      </Pressable>

      <View className="px-5">
        <AppText className="text-base leading-5">
          {requesterDisplayName} wants to be your friend.
        </AppText>
      </View>

      <View className="px-5">
        <View className="bg-muted h-px w-full" />
      </View>

      <View className="flex-row gap-2.5 px-5">
        <Button
          variant="primary"
          actionText="Accept"
          className="h-9! flex-1"
          disabled={disabled}
          onPress={onAccept}
        />
        <Button
          variant="secondary"
          actionText="Decline"
          className="h-9! flex-1"
          disabled={disabled}
          onPress={onDecline}
        />
      </View>
    </View>
  );
}
