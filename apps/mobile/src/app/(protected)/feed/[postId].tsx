import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUpIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import FeedCommentRow, {
  type FeedCommentData,
} from "@/src/components/feed/FeedCommentRow";
import FeedPostCard, {
  type FeedPostCardData,
} from "@/src/components/feed/FeedPostCard";
import { BackHeader } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { ScreenFooterShell } from "@/src/components/ScreenFooter";
import { TextField } from "@/src/components/TextField";
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
  const [pendingLikePostId, setPendingLikePostId] = useState<string | null>(
    null,
  );
  const [pendingLikeCommentId, setPendingLikeCommentId] = useState<
    string | null
  >(null);

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

  const normalizedCommentBody = commentBody.trim();
  const canSubmitComment =
    normalizedCommentBody.length >= MIN_COMMENT_LENGTH &&
    normalizedCommentBody.length <= MAX_COMMENT_LENGTH;

  const invalidateComments = useCallback(async () => {
    if (!postId) return;
    await Promise.all([
      utils.feed.comments.invalidate({ postId }),
      utils.feed.list.invalidate(),
    ]);
  }, [postId, utils.feed.comments, utils.feed.list]);

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
      await invalidateComments();
    },
    onError: () => {
      showError("Could not add comment. Please try again.");
    },
  });

  if (!postId) {
    return null;
  }

  return (
    <Screen
      footer={
        <ScreenFooterShell>
          <View className="h-13.5 flex-row items-center gap-2.5">
            <TextField
              className="bg-background min-w-0 flex-1"
              placeholder="Add a comment"
              returnKeyType="send"
              value={commentBody}
              onChangeText={setCommentBody}
              onSubmitEditing={() => {
                if (canSubmitComment && !addCommentMut.isPending) {
                  void addCommentMut.mutateAsync({
                    postId,
                    body: normalizedCommentBody,
                  });
                }
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post comment"
              className={`h-13.5 w-13.5 items-center justify-center ${
                canSubmitComment && !addCommentMut.isPending
                  ? "bg-primary"
                  : "bg-muted"
              }`}
              disabled={!canSubmitComment || addCommentMut.isPending}
              onPress={() =>
                void addCommentMut.mutateAsync({
                  postId,
                  body: normalizedCommentBody,
                })
              }
            >
              <ArrowUpIcon size={20} color={colors.text} weight="bold" />
            </Pressable>
          </View>
        </ScreenFooterShell>
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <BackHeader title="Comments" centered onBack={() => router.back()} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator />
        </View>
      ) : normalizedPost ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, gap: 20 }}
        >
          <FeedPostCard
            post={normalizedPost}
            pressable={false}
            isLikePending={pendingLikePostId === normalizedPost.id}
            onToggleLike={() =>
              void togglePostLikeMut.mutateAsync({ postId: normalizedPost.id })
            }
          />

          <View className="gap-5">
            {normalizedComments.length ? (
              normalizedComments.map((comment) => (
                <FeedCommentRow
                  key={comment.id}
                  comment={comment}
                  isLikePending={pendingLikeCommentId === comment.id}
                  onToggleLike={() =>
                    void toggleCommentLikeMut.mutateAsync({
                      commentId: comment.id,
                    })
                  }
                />
              ))
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
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <AppText color="#828083">Post not found.</AppText>
        </View>
      )}
    </Screen>
  );
}
