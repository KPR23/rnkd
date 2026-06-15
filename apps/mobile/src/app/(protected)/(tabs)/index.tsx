import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import FeedActionMenu from "@/src/components/feed/FeedActionMenu";
import FeedEmptyState from "@/src/components/feed/FeedEmptyState";
import {
  FeedDateHeading,
  FeedOlderPostsDivider,
} from "@/src/components/feed/FeedDateSection";
import FeedFloatingActionButton from "@/src/components/feed/FeedFloatingActionButton";
import FeedFriendRequestCard, {
  type FeedFriendRequestCardData,
} from "@/src/components/feed/FeedFriendRequestCard";
import FeedPostCard, {
  type FeedPostCardData,
} from "@/src/components/feed/FeedPostCard";
import {
  restoreFeedCaches,
  snapshotFeedCaches,
  togglePostLikeInCaches,
} from "@/src/lib/feed/feed-cache";
import { useFeedDeleteMenu } from "@/src/lib/feed/use-feed-delete-menu";
import {
  getFeedTimelineItemDate,
  getFeedTimelineItemKey,
  mergeFeedTimelineItems,
  type FeedTimelineItem,
} from "@/src/lib/feed/feed-items";
import { groupFeedPostsByDate } from "@/src/lib/feed/feed-time";
import { haptics } from "@/src/lib/haptics";
import { useMessage } from "@/src/lib/messages/message-provider";
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

function normalizeFriendRequest(request: {
  id: string;
  createdAt: Date;
  requester: FeedFriendRequestCardData["requester"];
}): FeedFriendRequestCardData {
  return {
    ...request,
    createdAt:
      request.createdAt instanceof Date
        ? request.createdAt
        : new Date(request.createdAt),
  };
}

export default function HomeTab() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [pendingLikePostId, setPendingLikePostId] = useState<string | null>(
    null,
  );
  const [pendingFriendRequestId, setPendingFriendRequestId] = useState<
    string | null
  >(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const { data: currentUser } = trpc.user.getCurrentUser.useQuery();
  const { openPostMenu, actionMenuProps } = useFeedDeleteMenu();
  const { data: groupsData } = trpc.group.list.useQuery();
  const {
    data: posts,
    isLoading: isPostsLoading,
  } = trpc.feed.list.useQuery();
  const {
    data: incomingFriendRequests,
    isLoading: isIncomingRequestsLoading,
  } = trpc.friend.listIncoming.useQuery();

  useEffect(() => {
    if (posts !== undefined || incomingFriendRequests !== undefined) {
      setHasLoadedOnce(true);
    }
  }, [posts, incomingFriendRequests]);

  const isInitialLoading =
    !hasLoadedOnce && (isPostsLoading || isIncomingRequestsLoading);
  const invalidateFeedData = useCallback(async () => {
    await Promise.all([
      utils.feed.list.invalidate(),
      utils.friend.listIncoming.invalidate(),
    ]);
  }, [utils.feed.list, utils.friend.listIncoming]);

  const removeIncomingRequest = useCallback(
    (requesterId: string) => {
      utils.friend.listIncoming.setData(undefined, (current) =>
        current?.filter((request) => request.requester.id !== requesterId) ??
        [],
      );
    },
    [utils.friend.listIncoming],
  );

  const acceptFriendRequestMut = trpc.friend.accept.useMutation({
    onMutate: async ({ requesterId }) => {
      setPendingFriendRequestId(requesterId);
      await utils.friend.listIncoming.cancel();
      const previous = utils.friend.listIncoming.getData();
      removeIncomingRequest(requesterId);
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.friend.listIncoming.setData(undefined, context.previous);
      }
      void haptics.warning();
      showError(error.message);
    },
    onSettled: async () => {
      setPendingFriendRequestId(null);
      await invalidateFeedData();
    },
  });

  const declineFriendRequestMut = trpc.friend.decline.useMutation({
    onMutate: async ({ requesterId }) => {
      setPendingFriendRequestId(requesterId);
      await utils.friend.listIncoming.cancel();
      const previous = utils.friend.listIncoming.getData();
      removeIncomingRequest(requesterId);
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.friend.listIncoming.setData(undefined, context.previous);
      }
      void haptics.warning();
      showError(error.message);
    },
    onSettled: async () => {
      setPendingFriendRequestId(null);
      await invalidateFeedData();
    },
  });

  const toggleLikeMut = trpc.feed.togglePostLike.useMutation({
    onMutate: async ({ postId }) => {
      setPendingLikePostId(postId);
      await utils.feed.list.cancel();
      const previous = snapshotFeedCaches(utils, postId);
      togglePostLikeInCaches(utils, postId);
      return { previous, postId };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        restoreFeedCaches(utils, context.previous, context.postId);
      }
      void haptics.warning();
      showError("Could not update like. Please try again.");
    },
    onSettled: async () => {
      setPendingLikePostId(null);
      await utils.feed.list.invalidate();
    },
  });

  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await invalidateFeedData();
    } catch (error) {
      console.error("Feed pull-to-refresh failed", error);
    } finally {
      setIsPullRefreshing(false);
    }
  }, [invalidateFeedData]);

  const normalizedPosts = useMemo(
    () => (posts ?? []).map(normalizePost),
    [posts],
  );

  const normalizedFriendRequests = useMemo(
    () => (incomingFriendRequests ?? []).map(normalizeFriendRequest),
    [incomingFriendRequests],
  );

  const feedItems = useMemo(
    () => mergeFeedTimelineItems(normalizedPosts, normalizedFriendRequests),
    [normalizedPosts, normalizedFriendRequests],
  );

  const feedItemsByKey = useMemo(
    () =>
      new Map(
        feedItems.map((item) => [getFeedTimelineItemKey(item), item] as const),
      ),
    [feedItems],
  );

  const groupedFeedItems = useMemo(
    () =>
      groupFeedPostsByDate(
        feedItems.map((item) => ({
          id: getFeedTimelineItemKey(item),
          createdAt: getFeedTimelineItemDate(item),
        })),
      ).map((group) => ({
        ...group,
        items: group.posts
          .map((entry) => feedItemsByKey.get(entry.id))
          .filter((item): item is FeedTimelineItem => item !== undefined),
      })),
    [feedItems, feedItemsByKey],
  );

  return (
    <View className="bg-background flex-1">
      <Screen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
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
            {isInitialLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator />
              </View>
            ) : groupedFeedItems.length ? (
              groupedFeedItems.map((group) => (
                <View key={`${group.label.primary}-${group.label.secondary ?? ""}`} className="gap-2.5">
                  {group.showOlderDividerBefore ? <FeedOlderPostsDivider /> : null}
                  <FeedDateHeading label={group.label} />
                  <View className="gap-2.5">
                    {group.items.map((item) =>
                      item.kind === "post" ? (
                        <FeedPostCard
                          key={getFeedTimelineItemKey(item)}
                          post={item.post}
                          isLikePending={pendingLikePostId === item.post.id}
                          onToggleLike={() =>
                            void toggleLikeMut.mutateAsync({
                              postId: item.post.id,
                            })
                          }
                          onMenuPress={
                            item.post.author.id === currentUser?.id &&
                            !item.post.isPending
                              ? (anchor) => openPostMenu(item.post.id, anchor)
                              : undefined
                          }
                        />
                      ) : (
                        <FeedFriendRequestCard
                          key={getFeedTimelineItemKey(item)}
                          request={item.request}
                          disabled={
                            pendingFriendRequestId === item.request.requester.id
                          }
                          onAccept={() =>
                            void acceptFriendRequestMut.mutateAsync({
                              requesterId: item.request.requester.id,
                            })
                          }
                          onDecline={() =>
                            void declineFriendRequestMut.mutateAsync({
                              requesterId: item.request.requester.id,
                            })
                          }
                        />
                      ),
                    )}
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

      <FeedActionMenu {...actionMenuProps} />
    </View>
  );
}
