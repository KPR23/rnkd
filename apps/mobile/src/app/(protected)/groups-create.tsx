import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import {
  BackHeader,
  GroupsTextInput,
  WizardFooter,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { trpc } from "@/src/utils/trpc";

const MIN_GROUP_NAME_LENGTH = 2;
const MAX_GROUP_NAME_LENGTH = 40;
const NAME_CHECK_DEBOUNCE_MS = 300;

export default function GroupsCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [debouncedGroupName, setDebouncedGroupName] = useState("");
  const normalizedGroupName = groupName.trim();
  const normalizedDebouncedName = debouncedGroupName.trim();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedGroupName(groupName);
    }, NAME_CHECK_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [groupName]);

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
        <WizardFooter
          actionText="Continue"
          disabled={!canContinue}
          step={1}
          totalSteps={3}
          onPress={() =>
            router.push({
              pathname: "/groups-invite",
              params: { mode: "create", groupName: normalizedGroupName },
            })
          }
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-5">
        <BackHeader title="Create new group" onBack={() => router.back()} />
        <View className="gap-2">
          <GroupsTextInput
            autoCapitalize="words"
            placeholder="Group Name"
            returnKeyType="next"
            value={groupName}
            onChangeText={setGroupName}
          />
          {nameFeedback?.tone === "loading" ? (
            <ActivityIndicator color={colors.textSecondary} />
          ) : nameFeedback?.message ? (
            <AppText
              className="text-sm"
              color={
                nameFeedback.tone === "error"
                  ? colors.destructiveText
                  : colors.textSecondary
              }
            >
              {nameFeedback.message}
            </AppText>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
