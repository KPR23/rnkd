import { useMemo, useState } from "react";
import { TextInput, View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { colors } from "@repo/ui/colors";
import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import { BackHeader, WizardFooter } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
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
        <WizardFooter
          actionText="Post"
          disabled={!canPost || createPostMut.isPending}
          onPress={() =>
            void createPostMut.mutateAsync({ body: normalizedBody })
          }
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-5">
        <BackHeader title="Create post" onBack={() => router.back()} />
        <View className="gap-2">
          <View className="border-border min-h-40 border px-4 py-3">
            <TextInput
              autoFocus
              multiline
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              className="text-text min-h-32 flex-1 text-base leading-5"
              style={{ textAlignVertical: "top" }}
              value={body}
              onChangeText={setBody}
            />
          </View>
          {bodyFeedback ? (
            <FormFieldFeedback
              tone={bodyFeedback.tone}
              message={bodyFeedback.message}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
