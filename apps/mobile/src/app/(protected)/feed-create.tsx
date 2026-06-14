import { useMemo, useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import { BackHeader } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { TextFieldMultiline } from "@/src/components/TextField";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

const MIN_POST_LENGTH = 1;
const MAX_POST_LENGTH = 2000;

export default function FeedCreateScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const [body, setBody] = useState("");

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
    normalizedBody.length >= MIN_POST_LENGTH &&
    normalizedBody.length <= MAX_POST_LENGTH;

  const createPostMut = trpc.feed.createPost.useMutation({
    onSuccess: async () => {
      await utils.feed.list.invalidate();
      router.back();
    },
    onError: () => {
      showError("Could not create post. Please try again.");
    },
  });

  return (
    <Screen
      footer={
        <ScreenFooter
          loading={createPostMut.isPending}
          primaryAction={{
            text: "Post",
            disabled: !canPost,
            onPress: () =>
              void createPostMut.mutateAsync({ body: normalizedBody }),
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
            className="min-h-40"
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
