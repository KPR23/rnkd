import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import type { FeedActionMenuItem } from "@/src/components/feed/FeedActionMenu";
import type { FeedMenuAnchor } from "@/src/components/feed/FeedCommentRow";
import {
  removeCommentFromCache,
  removePostFromFeedList,
} from "@/src/lib/feed/feed-cache";
import { haptics } from "@/src/lib/haptics";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

type FeedDeleteTarget =
  | { type: "post"; postId: string }
  | { type: "comment"; commentId: string };

type Options = {
  postId?: string;
  onPostDeleted?: () => void | Promise<void>;
  onCommentDeleted?: (commentId: string) => void | Promise<void>;
};

export function useFeedDeleteMenu(options: Options = {}) {
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<FeedMenuAnchor | null>(null);
  const [target, setTarget] = useState<FeedDeleteTarget | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setAnchor(null);
    setTarget(null);
  }, []);

  const deletePostMut = trpc.feed.deletePost.useMutation({
    onMutate: async ({ postId }) => {
      await utils.feed.list.cancel();
      const previousList = utils.feed.list.getData();
      removePostFromFeedList(utils, postId);
      return { previousList };
    },
    onSuccess: async () => {
      closeMenu();
      void haptics.success();
      await options.onPostDeleted?.();
    },
    onError: (_error, _input, context) => {
      if (context?.previousList) {
        utils.feed.list.setData(undefined, context.previousList);
      }
      void haptics.warning();
      showError("Could not remove post. Please try again.");
    },
    onSettled: async () => {
      await utils.feed.list.invalidate();
    },
  });

  const deleteCommentMut = trpc.feed.deleteComment.useMutation({
    onMutate: async ({ commentId }) => {
      const postId = options.postId;
      if (!postId) return {};

      await utils.feed.comments.cancel({ postId });
      const previousComments = utils.feed.comments.getData({ postId });
      removeCommentFromCache(utils, postId, commentId);
      return { previousComments, postId };
    },
    onSuccess: async (_data, variables) => {
      closeMenu();
      void haptics.success();
      await options.onCommentDeleted?.(variables.commentId);
    },
    onError: (_error, _input, context) => {
      if (context?.postId && context.previousComments) {
        utils.feed.comments.setData(
          { postId: context.postId },
          context.previousComments,
        );
      }
      void haptics.warning();
      showError("Could not remove comment. Please try again.");
    },
    onSettled: async () => {
      if (options.postId) {
        await utils.feed.comments.invalidate({ postId: options.postId });
      }
      await utils.feed.list.invalidate();
    },
  });

  const openPostMenu = useCallback(
    (postId: string, menuAnchor: FeedMenuAnchor) => {
      setAnchor(menuAnchor);
      setTarget({ type: "post", postId });
      setIsOpen(true);
    },
    [],
  );

  const openCommentMenu = useCallback(
    (commentId: string, menuAnchor: FeedMenuAnchor) => {
      setAnchor(menuAnchor);
      setTarget({ type: "comment", commentId });
      setIsOpen(true);
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    if (!target) return;

    if (target.type === "post") {
      const postId = target.postId;
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
      return;
    }

    const commentId = target.commentId;
    closeMenu();
    Alert.alert(
      "Remove comment",
      "Are you sure you want to remove this comment? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteCommentMut.mutate({ commentId }),
        },
      ],
    );
  }, [closeMenu, deleteCommentMut, deletePostMut, target]);

  const items = useMemo((): FeedActionMenuItem[] => {
    if (!target) return [];

    const isPending =
      target.type === "post"
        ? deletePostMut.isPending
        : deleteCommentMut.isPending;

    return [
      {
        label: target.type === "post" ? "Remove post" : "Remove comment",
        accessibilityLabel:
          target.type === "post" ? "Remove post" : "Remove comment",
        destructive: true,
        disabled: isPending,
        onPress: confirmDelete,
      },
    ];
  }, [
    confirmDelete,
    deleteCommentMut.isPending,
    deletePostMut.isPending,
    target,
  ]);

  return {
    openPostMenu,
    openCommentMenu,
    actionMenuProps: {
      visible: isOpen,
      anchor,
      items,
      onClose: closeMenu,
    },
  };
}
