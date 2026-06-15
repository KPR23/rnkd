import { useMemo, useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import { BackHeader } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import ScreenScroll from "@/src/components/ScreenScroll";
import { TextFieldMultiline } from "@/src/components/TextField";
import type { FeedPostCardData } from "@/src/components/feed/FeedPostCard";
import {
  createLocalId,
  prependPostToFeedList,
  removePostFromFeedListById,
  replacePostInFeedList,
} from "@/src/lib/feed/feed-cache";
import { haptics } from "@/src/lib/haptics";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

const MIN_POST_LENGTH = 1;
const MAX_POST_LENGTH = 2000;

export default function FeedCreateScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [body, setBody] = useState("");

  const { data: currentUser } = trpc.user.getCurrentUser.useQuery();

  const normalizedBody = body.trim();

  const bodyFeedback = useMemo(() => {
    if (!body) {
      return null;
    }

    if (normalizedBody.length < MIN_POST_LENGTH) {
      return {
        tone: "error" as const,
        message: "Post must contain at least 1 character.",
      };
    }

    if (normalizedBody.length > MAX_POST_LENGTH) {
      return {
        tone: "error" as const,
        message: `Post must be ${MAX_POST_LENGTH} characters or fewer.`,
      };
    }

    return null;
  }, [body, normalizedBody.length]);

  const canPost =
    !!currentUser &&
    normalizedBody.length >= MIN_POST_LENGTH &&
    normalizedBody.length <= MAX_POST_LENGTH;

  const createPostMut = trpc.feed.createPost.useMutation({
    onMutate: async ({ body: postBody }) => {
      if (!currentUser) {
        throw new Error("User not loaded");
      }

      await utils.feed.list.cancel();
      const previous = utils.feed.list.getData();
      const tempId = createLocalId("post");

      const optimisticPost: FeedPostCardData = {
        id: tempId,
        body: postBody,
        createdAt: new Date(),
        author: {
          id: currentUser.id,
          name: currentUser.name,
          tag: currentUser.tag,
          image: currentUser.image,
        },
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
        isPending: true,
      };

      prependPostToFeedList(utils, optimisticPost);
      router.back();

      return { previous, tempId };
    },
    onSuccess: (created, _input, context) => {
      if (context?.tempId) {
        replacePostInFeedList(utils, context.tempId, {
          ...created,
          createdAt:
            created.createdAt instanceof Date
              ? created.createdAt
              : new Date(created.createdAt),
        });
      }
      void haptics.success();
    },
    onError: (_error, _input, context) => {
      if (context?.tempId) {
        removePostFromFeedListById(utils, context.tempId);
      } else if (context?.previous) {
        utils.feed.list.setData(undefined, context.previous);
      }
      void haptics.warning();
      showError("Could not create post. Please try again.");
    },
    onSettled: async () => {
      await utils.feed.list.invalidate();
    },
  });

  const handlePost = () => {
    if (!canPost || createPostMut.isPending || !currentUser) return;
    void createPostMut.mutateAsync({ body: normalizedBody });
  };

  return (
    <Screen
      footer={
        <ScreenFooter
          primaryAction={{
            text: "Post",
            disabled: !canPost || createPostMut.isPending,
            haptic: "impact",
            onPress: handlePost,
          }}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenScroll
        header={<BackHeader title="Create post" onBack={() => router.back()} />}
      >
        <View className="gap-2">
          <TextFieldMultiline
            autoFocus
            placeholder="What's on your mind?"
            style={{ minHeight: 128 }}
            value={body}
            onChangeText={setBody}
          />
          {bodyFeedback ? (
            <FormFieldFeedback
              tone={bodyFeedback.tone}
              message={bodyFeedback.message}
            />
          ) : null}
        </View>
      </ScreenScroll>
    </Screen>
  );
}
