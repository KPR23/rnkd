import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import type { FeedActionMenuItem } from "@/src/components/feed/FeedActionMenu";
import type { FeedMenuAnchor } from "@/src/components/feed/FeedCommentRow";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

type FeedDeleteTarget =
  | { type: "post"; postId: string }
  | { type: "comment"; commentId: string };

type Options = {
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
    onSuccess: async () => {
      closeMenu();
      await utils.feed.list.invalidate();
      await options.onPostDeleted?.();
    },
    onError: () => {
      showError("Could not remove post. Please try again.");
    },
  });

  const deleteCommentMut = trpc.feed.deleteComment.useMutation({
    onSuccess: async (_data, variables) => {
      closeMenu();
      await options.onCommentDeleted?.(variables.commentId);
    },
    onError: () => {
      showError("Could not remove comment. Please try again.");
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
