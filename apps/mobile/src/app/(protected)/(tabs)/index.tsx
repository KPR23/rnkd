import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import FeedEmptyState from "@/src/components/feed/FeedEmptyState";
import {
  FeedDateHeading,
  FeedOlderPostsDivider,
} from "@/src/components/feed/FeedDateSection";
import FeedFloatingActionButton from "@/src/components/feed/FeedFloatingActionButton";
import type { FeedMenuAnchor } from "@/src/components/feed/FeedCommentRow";
import FeedPostCard, {
  type FeedPostCardData,
} from "@/src/components/feed/FeedPostCard";
import { useMessage } from "@/src/lib/messages/message-provider";
import { groupFeedPostsByDate } from "@/src/lib/feed/feed-time";
import { trpc } from "@/src/utils/trpc";

function normalizePost(post: {
  id: string;
  body: string;
  createdAt: Date;
  author: FeedPostCardData["author"];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}): FeedPostCardData {
  return {
    ...post,
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt
        : new Date(post.createdAt),
  };
}

export default function HomeTab() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [pendingLikePostId, setPendingLikePostId] = useState<string | null>(
    null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<FeedMenuAnchor | null>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);

  const { data: currentUser } = trpc.user.getCurrentUser.useQuery();
  const { data: groupsData } = trpc.group.list.useQuery();
  const {
    data: posts,
    isLoading,
    isRefetching,
  } = trpc.feed.list.useQuery();

  const toggleLikeMut = trpc.feed.togglePostLike.useMutation({
    onMutate: async ({ postId }) => {
      setPendingLikePostId(postId);
      await utils.feed.list.cancel();
      const previous = utils.feed.list.getData();

      utils.feed.list.setData(undefined, (current) => {
        if (!current) return current;

        return current.map((post) => {
          if (post.id !== postId) return post;

          const likedByMe = !post.likedByMe;
          return {
            ...post,
            likedByMe,
            likeCount: likedByMe
              ? post.likeCount + 1
              : Math.max(0, post.likeCount - 1),
          };
        });
      });

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        utils.feed.list.setData(undefined, context.previous);
      }
      showError("Could not update like. Please try again.");
    },
    onSettled: async () => {
      setPendingLikePostId(null);
      await utils.feed.list.invalidate();
    },
  });

  const handlePullRefresh = useCallback(async () => {
    try {
      await utils.feed.list.invalidate();
    } catch (error) {
      console.error("Feed pull-to-refresh failed", error);
    }
  }, [utils.feed.list]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setMenuAnchor(null);
    setMenuPostId(null);
  }, []);

  const deletePostMut = trpc.feed.deletePost.useMutation({
    onSuccess: async () => {
      closeMenu();
      await utils.feed.list.invalidate();
    },
    onError: () => {
      showError("Could not remove post. Please try again.");
    },
  });

  const openPostMenu = (postId: string, anchor: FeedMenuAnchor) => {
    setMenuAnchor(anchor);
    setMenuPostId(postId);
    setIsMenuOpen(true);
  };

  const confirmDeletePost = () => {
    if (!menuPostId) return;
    const postId = menuPostId;
    closeMenu();

    Alert.alert(
      "Remove post",
      "Are you sure you want to remove this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deletePostMut.mutate({ postId }),
        },
      ],
    );
  };

  const normalizedPosts = useMemo(
    () => (posts ?? []).map(normalizePost),
    [posts],
  );

  const groupedPosts = useMemo(
    () => groupFeedPostsByDate(normalizedPosts),
    [normalizedPosts],
  );

  return (
    <View className="bg-background flex-1">
      <Screen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handlePullRefresh}
            />
          }
        >
          <ScreenTitle
            title="Feed"
            globalRs={groupsData?.currentUserGlobalRs ?? 0}
            showRsBadge={!!groupsData}
          />

          <View className="gap-5 pb-6">
            {isLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator />
              </View>
            ) : groupedPosts.length ? (
              groupedPosts.map((group) => (
                <View key={`${group.label.primary}-${group.label.secondary ?? ""}`} className="gap-2.5">
                  {group.showOlderDividerBefore ? <FeedOlderPostsDivider /> : null}
                  <FeedDateHeading label={group.label} />
                  <View className="gap-2.5">
                    {group.posts.map((post) => (
                      <FeedPostCard
                        key={post.id}
                        post={post}
                        isLikePending={pendingLikePostId === post.id}
                        onToggleLike={() =>
                          void toggleLikeMut.mutateAsync({ postId: post.id })
                        }
                        onMenuPress={
                          post.author.id === currentUser?.id
                            ? (anchor) => openPostMenu(post.id, anchor)
                            : undefined
                        }
                      />
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <FeedEmptyState
                title="Your feed is quiet"
                description="Create a post or add friends to start seeing activity here."
              />
            )}
          </View>
        </ScrollView>
      </Screen>

      <FeedFloatingActionButton
        onPress={() => router.push("/feed-create")}
      />

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            className="absolute inset-0"
            onPress={closeMenu}
          />
          {menuAnchor ? (
            <View
              className="border-muted bg-card absolute min-w-48 border p-2"
              style={{
                top: menuAnchor.top,
                right: menuAnchor.right,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove post"
                className="px-3 py-3"
                disabled={deletePostMut.isPending}
                onPress={confirmDeletePost}
              >
                <AppText
                  className="text-sm"
                  color={colors.destructiveText}
                  weight="medium"
                >
                  Remove post
                </AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
