import { useMemo, useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import { BackHeader, GroupsTextInput } from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useMessage } from "@/src/lib/messages/message-provider";
import { openGroupAfterWizard } from "@/src/lib/navigation/groups";
import { trpc } from "@/src/utils/trpc";

const INVITE_CODE_LENGTH = 8;

export default function GroupsJoinScreen() {
  const router = useRouter();
  const { showMessage, showError } = useMessage();
  const [code, setCode] = useState("");
  const debouncedCode = useDebouncedValue(code);
  const normalizedCode = code.trim().toUpperCase();
  const normalizedDebouncedCode = debouncedCode.trim().toUpperCase();
  const utils = trpc.useUtils();
  const joinGroup = trpc.group.joinByCode.useMutation({
    onSuccess: async ({ groupId, pending }) => {
      await utils.group.invalidate();

      if (pending) {
        showMessage("The group owner will review your request");
        router.back();
        return;
      }

      openGroupAfterWizard(router, groupId);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const canCheckCode = normalizedDebouncedCode.length === INVITE_CODE_LENGTH;

  const inviteCodeValidation = trpc.group.validateInviteCode.useQuery(
    { code: normalizedDebouncedCode },
    { enabled: canCheckCode },
  );

  const isDebouncing = normalizedCode !== normalizedDebouncedCode;
  const isCheckingCode =
    canCheckCode && (isDebouncing || inviteCodeValidation.isFetching);

  const codeFeedback = useMemo(() => {
    if (!normalizedCode) {
      return null;
    }

    if (normalizedCode.length < INVITE_CODE_LENGTH) {
      return {
        tone: "error" as const,
        message: `Group code must be ${INVITE_CODE_LENGTH} characters.`,
      };
    }

    if (normalizedCode.length > INVITE_CODE_LENGTH) {
      return {
        tone: "error" as const,
        message: `Group code must be ${INVITE_CODE_LENGTH} characters.`,
      };
    }

    if (isCheckingCode) {
      return { tone: "loading" as const, message: null };
    }

    const validation = inviteCodeValidation.data;

    if (!validation?.valid) {
      if (validation?.reason === "pending_invitation") {
        return {
          tone: "error" as const,
          message:
            "You already have a pending invitation to this group. Accept it from the Groups tab.",
        };
      }

      return {
        tone: "error" as const,
        message: "Invalid group code",
      };
    }

    if (validation.reason === "already_member") {
      return {
        tone: "success" as const,
        message: `You're already in ${validation.groupName}.`,
      };
    }

    return {
      tone: "success" as const,
      message: `Join ${validation.groupName}?`,
    };
  }, [inviteCodeValidation.data, isCheckingCode, normalizedCode]);

  const canJoin =
    normalizedCode.length === INVITE_CODE_LENGTH &&
    !isCheckingCode &&
    inviteCodeValidation.data?.valid === true &&
    !joinGroup.isPending;

  return (
    <Screen
      footer={
        <ScreenFooter
          primaryAction={{
            text: "Join group",
            disabled: !canJoin,
            onPress: () => joinGroup.mutate({ code: normalizedCode }),
          }}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-6">
        <BackHeader title="Join new group" onBack={() => router.back()} />
        <View className="gap-2">
          <GroupsTextInput
            autoCapitalize="characters"
            placeholder="Group code"
            returnKeyType="done"
            maxLength={INVITE_CODE_LENGTH}
            value={code}
            onChangeText={setCode}
          />
          {codeFeedback ? (
            <FormFieldFeedback
              tone={codeFeedback.tone}
              message={codeFeedback.message}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
