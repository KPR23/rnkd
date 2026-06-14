import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUpIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FeedActionMenu from "@/src/components/feed/FeedActionMenu";
import FeedCommentThread from "@/src/components/feed/FeedCommentThread";
import {
  type FeedCommentData,
  type FeedMenuAnchor,
} from "@/src/components/feed/FeedCommentRow";
import FeedPostCard, {
  type FeedPostCardData,
} from "@/src/components/feed/FeedPostCard";
import { BackHeader } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { ScreenFooterShell } from "@/src/components/ScreenFooter";
import { TextField } from "@/src/components/TextField";
import { groupCommentsByParent } from "@/src/lib/feed/comment-threads";
import { useFeedDeleteMenu } from "@/src/lib/feed/use-feed-delete-menu";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

const MIN_COMMENT_LENGTH = 1;
const MAX_COMMENT_LENGTH = 1000;

function normalizePost(post: FeedPostCardData): FeedPostCardData {
  return {
    ...post,
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt
        : new Date(post.createdAt),
  };
}

function normalizeComment(comment: FeedCommentData): FeedCommentData {
  return {
    ...comment,
    parentCommentId: comment.parentCommentId ?? null,
    createdAt:
      comment.createdAt instanceof Date
        ? comment.createdAt
        : new Date(comment.createdAt),
  };
}

export default function FeedCommentsScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [commentBody, setCommentBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<FeedCommentData | null>(null);
  const [pendingLikePostId, setPendingLikePostId] = useState<string | null>(
    null,
  );
  const [pendingLikeCommentId, setPendingLikeCommentId] = useState<
    string | null
  >(null);
  const commentInputRef = useRef<TextInput>(null);

  const invalidateComments = useCallback(async () => {
    if (!postId) return;
    await Promise.all([
      utils.feed.comments.invalidate({ postId }),
      utils.feed.list.invalidate(),
    ]);
  }, [postId, utils.feed.comments, utils.feed.list]);

  const { openPostMenu, openCommentMenu, actionMenuProps } = useFeedDeleteMenu({
    onPostDeleted: () => router.back(),
    onCommentDeleted: async (commentId) => {
      setReplyTarget((current) =>
        current?.id === commentId ? null : current,
      );
      await invalidateComments();
    },
  });

  const { data: currentUser } = trpc.user.getCurrentUser.useQuery();
  const { data, isLoading, isRefetching } = trpc.feed.comments.useQuery(
    { postId: postId ?? "" },
    { enabled: !!postId },
  );

  const normalizedPost = useMemo(
    () => (data?.post ? normalizePost(data.post) : null),
    [data?.post],
  );

  const normalizedComments = useMemo(
    () => (data?.comments ?? []).map(normalizeComment),
    [data?.comments],
  );

  const { topLevel: topLevelComments, repliesByParent } = useMemo(
    () => groupCommentsByParent(normalizedComments),
    [normalizedComments],
  );

  const normalizedCommentBody = commentBody.trim();
  const canSubmitComment =
    normalizedCommentBody.length >= MIN_COMMENT_LENGTH &&
    normalizedCommentBody.length <= MAX_COMMENT_LENGTH;

  const togglePostLikeMut = trpc.feed.togglePostLike.useMutation({
    onMutate: async ({ postId: likedPostId }) => {
      if (!postId) return;
      setPendingLikePostId(likedPostId);
      await utils.feed.comments.cancel({ postId });
      const previous = utils.feed.comments.getData({ postId });

      utils.feed.comments.setData({ postId }, (current) => {
        if (!current) return current;

        const likedByMe = !current.post.likedByMe;
        return {
          ...current,
          post: {
            ...current.post,
            likedByMe,
            likeCount: likedByMe
              ? current.post.likeCount + 1
              : Math.max(0, current.post.likeCount - 1),
          },
        };
      });

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (postId && context?.previous) {
        utils.feed.comments.setData({ postId }, context.previous);
      }
      showError("Could not update like. Please try again.");
    },
    onSettled: async () => {
      setPendingLikePostId(null);
      await invalidateComments();
    },
  });

  const toggleCommentLikeMut = trpc.feed.toggleCommentLike.useMutation({
    onMutate: async ({ commentId }) => {
      if (!postId) return;
      setPendingLikeCommentId(commentId);
      await utils.feed.comments.cancel({ postId });
      const previous = utils.feed.comments.getData({ postId });

      utils.feed.comments.setData({ postId }, (current) => {
        if (!current) return current;

        return {
          ...current,
          comments: current.comments.map((comment) => {
            if (comment.id !== commentId) return comment;

            const likedByMe = !comment.likedByMe;
            return {
              ...comment,
              likedByMe,
              likeCount: likedByMe
                ? comment.likeCount + 1
                : Math.max(0, comment.likeCount - 1),
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (postId && context?.previous) {
        utils.feed.comments.setData({ postId }, context.previous);
      }
      showError("Could not update like. Please try again.");
    },
    onSettled: async () => {
      setPendingLikeCommentId(null);
      await invalidateComments();
    },
  });

  const addCommentMut = trpc.feed.addComment.useMutation({
    onSuccess: async () => {
      setCommentBody("");
      setReplyTarget(null);
      await invalidateComments();
    },
    onError: () => {
      showError("Could not add comment. Please try again.");
    },
  });

  const submitComment = () => {
    if (!postId || !canSubmitComment || addCommentMut.isPending) return;

    void addCommentMut.mutateAsync({
      postId,
      body: normalizedCommentBody,
      parentCommentId: replyTarget?.id,
    });
  };

  const handleReply = (comment: FeedCommentData) => {
    setReplyTarget((current) => (current?.id === comment.id ? null : comment));
  };

  useEffect(() => {
    if (!replyTarget) return;

    const frame = requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [replyTarget?.id]);

  const handleOpenPostMenu = (anchor: FeedMenuAnchor) => {
    if (!postId) return;
    openPostMenu(postId, anchor);
  };

  const handleOpenCommentMenu = (
    comment: FeedCommentData,
    anchor: FeedMenuAnchor,
  ) => {
    openCommentMenu(comment.id, anchor);
  };

  const isPostOwner = normalizedPost?.author.id === currentUser?.id;
  const commentPlaceholder = replyTarget
    ? `Reply to ${replyTarget.author.name}`
    : "Add a comment";

  if (!postId) {
    return null;
  }

  return (
    <Screen
      footer={
        <ScreenFooterShell>
          <View className="h-13.5 flex-row items-center gap-2.5">
            <TextField
              ref={commentInputRef}
              className="bg-background min-w-0 flex-1"
              placeholder={commentPlaceholder}
              returnKeyType="send"
              value={commentBody}
              onChangeText={setCommentBody}
              onSubmitEditing={submitComment}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={replyTarget ? "Post reply" : "Post comment"}
              className={`h-13.5 w-13.5 items-center justify-center ${
                canSubmitComment && !addCommentMut.isPending
                  ? "bg-primary"
                  : "bg-muted"
              }`}
              disabled={!canSubmitComment || addCommentMut.isPending}
              onPress={submitComment}
            >
              <ArrowUpIcon size={20} color={colors.text} weight="bold" />
            </Pressable>
          </View>
        </ScreenFooterShell>
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenScroll
        header={
          <BackHeader title="Comments" centered onBack={() => router.back()} />
        }
      >
        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
          </View>
        ) : normalizedPost ? (
          <>
            <FeedPostCard
              post={normalizedPost}
              pressable={false}
              isLikePending={pendingLikePostId === normalizedPost.id}
              onToggleLike={() =>
                void togglePostLikeMut.mutateAsync({ postId: normalizedPost.id })
              }
              onMenuPress={isPostOwner ? handleOpenPostMenu : undefined}
            />

            <View className="gap-5">
              {topLevelComments.length ? (
                <FeedCommentThread
                  comments={topLevelComments}
                  repliesByParent={repliesByParent}
                  currentUserId={currentUser?.id}
                  pendingLikeCommentId={pendingLikeCommentId}
                  replyTargetId={replyTarget?.id ?? null}
                  onToggleLike={(commentId) =>
                    void toggleCommentLikeMut.mutateAsync({ commentId })
                  }
                  onReply={handleReply}
                  onMenuPress={handleOpenCommentMenu}
                />
              ) : (
                <AppText className="text-center text-sm" color="#828083">
                  No comments yet. Be the first to reply.
                </AppText>
              )}
            </View>

            {isRefetching ? (
              <View className="items-center py-2">
                <ActivityIndicator size="small" />
              </View>
            ) : null}
          </>
        ) : (
          <View className="items-center justify-center py-10">
            <AppText color="#828083">Post not found.</AppText>
          </View>
        )}
      </ScreenScroll>

      <FeedActionMenu {...actionMenuProps} />
    </Screen>
  );
}
