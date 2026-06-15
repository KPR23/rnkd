import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";

import { useRouter } from "expo-router";
import {
  ChatCircleIcon,
  DotsThreeIcon,
  ExportIcon,
  HeartStraightIcon,
} from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import UserProfileImage from "@/src/components/UserProfileImage";
import { formatFeedRelativeTime } from "@/src/lib/feed/feed-time";
import { formatUserDisplayName } from "@/src/lib/user/format-user-display-name";

import { toFeedUser } from "./feed-user";
import type { FeedMenuAnchor } from "./FeedCommentRow";

export type FeedPostAuthor = {
  id: string;
  name: string;
  tag?: string | null;
  image?: string | null;
};

export type FeedPostCardData = {
  id: string;
  body: string;
  createdAt: Date;
  author: FeedPostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type Props = {
  post: FeedPostCardData;
  onToggleLike?: () => void;
  onMenuPress?: (anchor: FeedMenuAnchor) => void;
  isLikePending?: boolean;
  showActions?: boolean;
  pressable?: boolean;
  onPressComments?: () => void;
};

export default function FeedPostCard({
  post,
  onToggleLike,
  onMenuPress,
  isLikePending = false,
  showActions = true,
  pressable = true,
  onPressComments,
}: Props) {
  const router = useRouter();
  const menuButtonRef = useRef<View>(null);
  const createdAt =
    post.createdAt instanceof Date
      ? post.createdAt
      : new Date(post.createdAt);
  const relativeTime = formatFeedRelativeTime(createdAt);
  const authorDisplayName = formatUserDisplayName(post.author);

  const handleOpenPost = () => {
    router.push(`/feed/${post.id}`);
  };

  const handleCommentsPress = () => {
    if (onPressComments) {
      onPressComments();
      return;
    }

    handleOpenPost();
  };

  const cardClassName = "border-muted bg-card gap-3.5 border py-4";

  const handleMenuPress = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth } = Dimensions.get("window");
      onMenuPress?.({
        top: y + height + 8,
        right: screenWidth - x - width,
      });
    });
  };

  const content = (
    <>
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          className="min-w-0 flex-1 flex-row items-center gap-2.5"
          onPress={() => router.push(`/player/${post.author.id}`)}
        >
          <View className="size-10 overflow-hidden rounded-full">
            <UserProfileImage user={toFeedUser(post.author)} size={40} />
          </View>
          <View className="min-w-0 flex-1">
            <AppText className="text-base leading-5" weight="medium">
              {authorDisplayName}
            </AppText>
            <AppText className="text-sm leading-5" color="#828083">
              Post · {relativeTime}
            </AppText>
          </View>
        </Pressable>
        {onMenuPress ? (
          <Pressable
            ref={menuButtonRef}
            accessibilityRole="button"
            accessibilityLabel="Post options"
            className="size-6 items-center justify-center"
            onPress={handleMenuPress}
          >
            <DotsThreeIcon size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View className="size-6" />
        )}
      </View>

      <View className="px-5">
        <AppText className="text-base leading-5">{post.body}</AppText>
      </View>

      {showActions ? (
        <>
          <View className="px-5">
            <View className="bg-muted h-px w-full" />
          </View>
          <View className="flex-row items-center gap-2 pl-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Like post"
              className="flex-row items-center gap-1 px-2"
              disabled={isLikePending}
              onPress={onToggleLike}
            >
              <HeartStraightIcon
                size={20}
                color={post.likedByMe ? colors.primary : colors.textSecondary}
                weight={post.likedByMe ? "fill" : "regular"}
              />
              {post.likeCount > 0 ? (
                <AppText
                  className="text-sm"
                  color={post.likedByMe ? colors.text : "#828083"}
                  weight={post.likedByMe ? "medium" : "regular"}
                >
                  {post.likeCount}
                </AppText>
              ) : (
                <AppText className="text-sm" color="#828083">
                  Be the first to like this!
                </AppText>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View comments"
              className="flex-row items-center gap-1 px-2"
              onPress={handleCommentsPress}
            >
              <ChatCircleIcon size={20} color={colors.textSecondary} />
              <AppText className="text-sm" color="#828083">
                {post.commentCount}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share post"
              className="px-2"
            >
              <ExportIcon size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </>
      ) : null}
    </>
  );

  if (!pressable) {
    return <View className={cardClassName}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open post"
      className={cardClassName}
      onPress={handleOpenPost}
    >
      {content}
    </Pressable>
  );
}
