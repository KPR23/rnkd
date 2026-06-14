import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import FeedEmptyState from "@/src/components/feed/FeedEmptyState";
import {
  FeedDateHeading,
  FeedOlderPostsDivider,
} from "@/src/components/feed/FeedDateSection";
import FeedFloatingActionButton from "@/src/components/feed/FeedFloatingActionButton";
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
    </View>
  );
}
