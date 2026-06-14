import { useMemo, useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import {
  BackHeader,
  GroupsTextInput,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { trpc } from "@/src/utils/trpc";

const MIN_GROUP_NAME_LENGTH = 2;
const MAX_GROUP_NAME_LENGTH = 40;

export default function GroupsCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const debouncedGroupName = useDebouncedValue(groupName);
  const normalizedGroupName = groupName.trim();
  const normalizedDebouncedName = debouncedGroupName.trim();

  const canCheckName =
    normalizedDebouncedName.length >= MIN_GROUP_NAME_LENGTH &&
    normalizedDebouncedName.length <= MAX_GROUP_NAME_LENGTH;

  const nameAvailability = trpc.group.isNameAvailable.useQuery(
    { name: normalizedDebouncedName },
    { enabled: canCheckName },
  );

  const isDebouncing = normalizedGroupName !== normalizedDebouncedName;
  const isCheckingName =
    canCheckName && (isDebouncing || nameAvailability.isFetching);

  const nameFeedback = useMemo(() => {
    if (!normalizedGroupName) {
      return null;
    }

    if (normalizedGroupName.length < MIN_GROUP_NAME_LENGTH) {
      return {
        tone: "error" as const,
        message: "Group name must be at least 2 characters.",
      };
    }

    if (normalizedGroupName.length > MAX_GROUP_NAME_LENGTH) {
      return {
        tone: "error" as const,
        message: "Group name must be 40 characters or fewer.",
      };
    }

    if (isCheckingName) {
      return { tone: "loading" as const, message: null };
    }

    if (nameAvailability.data?.available === false) {
      return {
        tone: "error" as const,
        message: "Group name already exists",
      };
    }

    return null;
  }, [
    isCheckingName,
    nameAvailability.data?.available,
    normalizedGroupName,
  ]);

  const canContinue =
    normalizedGroupName.length >= MIN_GROUP_NAME_LENGTH &&
    normalizedGroupName.length <= MAX_GROUP_NAME_LENGTH &&
    !isCheckingName &&
    nameAvailability.data?.available === true;

  return (
    <Screen
      footer={
        <ScreenFooter
          primaryAction={{
            text: "Continue",
            disabled: !canContinue,
            onPress: () =>
              router.push({
                pathname: "/groups-invite",
                params: { mode: "create", groupName: normalizedGroupName },
              }),
          }}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenScroll
        header={
          <BackHeader title="Create new group" onBack={() => router.back()} />
        }
      >
        <View className="gap-2">
          <GroupsTextInput
            autoCapitalize="words"
            placeholder="Group Name"
            returnKeyType="next"
            value={groupName}
            onChangeText={setGroupName}
          />
          {nameFeedback ? (
            <FormFieldFeedback
              tone={nameFeedback.tone}
              message={nameFeedback.message}
            />
          ) : null}
        </View>
      </ScreenScroll>
    </Screen>
  );
}
