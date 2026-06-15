import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import type { User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import {
  BackHeader,
  OwnedGroupInviteRow,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import UserProfileImage from "@/src/components/UserProfileImage";
import { useMessage } from "@/src/lib/messages/message-provider";
import { formatUserDisplayName } from "@/src/lib/user/format-user-display-name";
import { trpc } from "@/src/utils/trpc";

function toProfileUser(u: {
  id: string;
  name: string;
  tag: string | null;
  image: string | null;
}): User {
  return {
    ...u,
    email: "",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
}

export default function GroupsInvitePlayerScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { showError, showMessage } = useMessage();
  const utils = trpc.useUtils();
  const [invitingGroupId, setInvitingGroupId] = useState<string | null>(null);

  const {
    data: player,
    isLoading: isLoadingPlayer,
    isError: isPlayerError,
  } = trpc.user.getPublicById.useQuery(
    { id: userId ?? "" },
    { enabled: !!userId },
  );

  const {
    data: ownedGroups = [],
    isLoading: isLoadingGroups,
    isError: isGroupsError,
  } = trpc.group.ownedGroupsForInvite.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );

  const inviteToGroup = trpc.group.invite.useMutation({
    onSuccess: async (result, variables) => {
      await utils.group.ownedGroupsForInvite.invalidate({ userId: userId ?? "" });
      await utils.group.invalidate();

      const groupName =
        ownedGroups.find((group) => group.id === variables.groupId)?.name ??
        "the group";

      if (result.invitedCount > 0) {
        showMessage(`Invited to ${groupName}`);
      } else {
        showError("Could not send the invite.");
      }

      setInvitingGroupId(null);
    },
    onError: (error) => {
      showError(error.message);
      setInvitingGroupId(null);
    },
  });

  if (!userId) {
    return null;
  }

  const playerDisplayName = player
    ? formatUserDisplayName(player)
    : "this player";
  const isLoading = isLoadingPlayer || isLoadingGroups;
  const isError = isPlayerError || isGroupsError;

  const handleInvite = (groupId: string) => {
    setInvitingGroupId(groupId);
    inviteToGroup.mutate({
      groupId,
      userIds: [userId],
    });
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenScroll
        header={
          <BackHeader
            title="Invite to group"
            centered
            onBack={() => router.back()}
          />
        }
      >
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator />
          </View>
        ) : isError || !player ? (
          <View className="border-muted bg-card border px-4 py-6">
            <AppText className="text-center text-sm" color={colors.textSecondary}>
              Player not found.
            </AppText>
          </View>
        ) : (
          <View className="gap-6">
            <View className="border-muted bg-card flex-row items-center gap-3 border px-4 py-4">
              <UserProfileImage user={toProfileUser(player)} size={48} />
              <View className="min-w-0 flex-1">
                <AppText className="text-base leading-5" weight="medium">
                  {playerDisplayName}
                </AppText>
                <AppText className="text-sm leading-5" color={colors.textSecondary}>
                  Choose a group to invite them to.
                </AppText>
              </View>
            </View>

            <View className="gap-2.5">
              <SectionLabel title="Your groups" />
              {ownedGroups.length ? (
                <View className="gap-2">
                  {ownedGroups.map((group) => (
                    <OwnedGroupInviteRow
                      key={group.id}
                      group={group}
                      disabled={inviteToGroup.isPending}
                      isInviting={invitingGroupId === group.id}
                      onInvite={() => handleInvite(group.id)}
                    />
                  ))}
                </View>
              ) : (
                <View className="border-muted bg-card gap-4 border px-4 py-6">
                  <AppText
                    className="text-center text-sm"
                    color={colors.textSecondary}
                  >
                    You do not own any groups yet.
                  </AppText>
                  <Button
                    actionText="Create group"
                    className="h-11"
                    variant="primary"
                    onPress={() => router.push("/groups-create")}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}
