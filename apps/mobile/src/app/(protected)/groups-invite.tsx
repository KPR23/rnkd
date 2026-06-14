import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  BackHeader,
  FriendSuggestionRow,
  GroupsTextInput,
  SectionLabel,
  WizardFooter,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import { DismissKeyboardScrollView } from "@/src/lib/keyboard/dismiss-keyboard";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

export default function GroupsInviteScreen() {
  const router = useRouter();
  const { showError } = useMessage();
  const {
    mode = "invite",
    groupId,
    groupName,
  } = useLocalSearchParams<{
    mode?: "create" | "invite";
    groupId?: string;
    groupName?: string;
  }>();
  const [search, setSearch] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(
    () => new Set(),
  );
  const utils = trpc.useUtils();

  const { data: friends = [], isLoading } = trpc.group.inviteCandidates.useQuery(
    {
      groupId: mode === "invite" ? groupId : undefined,
      search,
    },
    {
      enabled: mode === "create" || !!groupId,
    },
  );

  const createGroup = trpc.group.create.useMutation({
    onSuccess: async (result) => {
      await utils.group.invalidate();
      router.replace({
        pathname: "/groups-created",
        params: {
          groupId: result.groupId,
        },
      });
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const inviteToGroup = trpc.group.invite.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
      router.back();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const toggleFriend = (friendId: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);

      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }

      return next;
    });
  };

  const handleInvite = () => {
    const userIds = Array.from(selectedFriendIds);

    if (mode === "create") {
      if (!groupName) return;

      createGroup.mutate({
        name: groupName,
        inviteUserIds: userIds,
      });
      return;
    }

    if (!groupId) return;

    inviteToGroup.mutate({
      groupId,
      userIds,
    });
  };

  const isSubmitting = createGroup.isPending || inviteToGroup.isPending;

  return (
    <Screen
      footer={
        <WizardFooter
          actionText={mode === "create" ? "Create group" : "Invite selected"}
          disabled={
            (mode === "invite" && selectedFriendIds.size === 0) || isSubmitting
          }
          step={mode === "create" ? 2 : undefined}
          totalSteps={mode === "create" ? 3 : undefined}
          onPress={handleInvite}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <DismissKeyboardScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          <BackHeader
            title={mode === "create" ? "Invite friends to your group" : "Invite friends"}
            centered={mode !== "create"}
            onBack={() => router.back()}
          />

          <GroupsTextInput
            placeholder="Search friends"
            returnKeyType="search"
            search
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />

          <View className="gap-2.5">
            <SectionLabel title="Suggested friends" />
            <View className="gap-2">
              {isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator />
                </View>
              ) : friends.length ? (
                friends.map((friend) => (
                <FriendSuggestionRow
                  key={friend.id}
                  friend={friend}
                  selected={selectedFriendIds.has(friend.id)}
                  onPress={() => toggleFriend(friend.id)}
                />
                ))
              ) : (
                <View className="border-muted bg-card border px-4 py-6">
                  <AppText className="text-center text-sm" color="#828083">
                    No friends available to invite.
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </DismissKeyboardScrollView>
    </Screen>
  );
}
