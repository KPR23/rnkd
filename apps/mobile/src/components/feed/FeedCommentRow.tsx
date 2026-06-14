import { useRef } from "react";
import {
  Dimensions,
  Pressable,
  View,
  type View as ViewType,
} from "react-native";

import { DotsThreeIcon, HeartStraightIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import UserProfileImage from "@/src/components/UserProfileImage";
import { formatFeedRelativeTime } from "@/src/lib/feed/feed-time";

import { toFeedUser } from "./feed-user";
import type { FeedPostAuthor } from "./FeedPostCard";

export type FeedMenuAnchor = {
  top: number;
  right: number;
};

export type FeedCommentData = {
  id: string;
  body: string;
  createdAt: Date;
  parentCommentId: string | null;
  author: FeedPostAuthor;
  likeCount: number;
  likedByMe: boolean;
};

type Props = {
  comment: FeedCommentData;
  depth?: number;
  onToggleLike?: () => void;
  onReply?: () => void;
  onMenuPress?: (anchor: FeedMenuAnchor) => void;
  showMenu?: boolean;
  isLikePending?: boolean;
};

export default function FeedCommentRow({
  comment,
  depth = 0,
  onToggleLike,
  onReply,
  onMenuPress,
  showMenu = false,
  isLikePending = false,
}: Props) {
  const menuButtonRef = useRef<ViewType>(null);
  const createdAt =
    comment.createdAt instanceof Date
      ? comment.createdAt
      : new Date(comment.createdAt);
  const relativeTime = formatFeedRelativeTime(createdAt);
  const indentClassName = depth > 0 ? "pl-12" : "";

  const handleMenuPress = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth } = Dimensions.get("window");
      onMenuPress?.({
        top: y + height + 8,
        right: screenWidth - x - width,
      });
    });
  };

  return (
    <View className={`gap-2.5 ${indentClassName}`}>
      <View className="flex-row items-start gap-4">
        <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
          <View className="size-10 overflow-hidden rounded-full">
            <UserProfileImage user={toFeedUser(comment.author)} size={40} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center">
              <AppText className="text-base leading-5" weight="medium">
                {comment.author.name}
              </AppText>
              <AppText className="text-base leading-5" color="#828083">
                {" "}
                ·{" "}
              </AppText>
              <AppText className="text-sm leading-5" color="#828083">
                {relativeTime}
              </AppText>
            </View>
            <AppText className="mt-0.5 text-sm leading-5">
              {comment.body}
            </AppText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Like comment"
          className="pt-5"
          disabled={isLikePending}
          onPress={onToggleLike}
        >
          <HeartStraightIcon
            size={20}
            color={comment.likedByMe ? colors.primary : colors.textSecondary}
            weight={comment.likedByMe ? "fill" : "regular"}
          />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between pl-12">
        <View className="flex-row items-center gap-3">
          <AppText className="text-[13px] leading-5" color="#828083">
            {comment.likeCount > 0
              ? `${comment.likeCount} like${comment.likeCount === 1 ? "" : "s"}`
              : "0 likes"}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.author.name}`}
            onPress={onReply}
          >
            <AppText className="text-[13px] leading-5" color="#828083">
              Reply
            </AppText>
          </Pressable>
        </View>
        {showMenu ? (
          <Pressable
            ref={menuButtonRef}
            accessibilityRole="button"
            accessibilityLabel="Comment options"
            onPress={handleMenuPress}
          >
            <DotsThreeIcon size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
