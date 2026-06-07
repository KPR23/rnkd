import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  GroupCard,
  GroupInviteCard,
  GroupsButtonRow,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import ScreenTitle from "@/src/components/ScreenTitle";
import { trpc } from "@/src/utils/trpc";

export default function GroupsTab() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const {
    data,
    isLoading,
    isRefetching: isGroupsRefetching,
  } = trpc.group.list.useQuery();
  const {
    data: pendingInvites,
    isRefetching: isInvitesRefetching,
  } = trpc.group.pendingInvites.useQuery();

  const invalidateGroups = async () => {
    await Promise.all([
      utils.group.list.invalidate(),
      utils.group.pendingInvites.invalidate(),
    ]);
  };

  const handlePullRefresh = useCallback(async () => {
    try {
      await invalidateGroups();
    } catch (error) {
      console.error("Groups pull-to-refresh failed", error);
    }
  }, [utils.group.list, utils.group.pendingInvites]);

  const acceptInviteMut = trpc.group.acceptInvite.useMutation({
    onSuccess: async ({ groupId }) => {
      await invalidateGroups();
      router.push(`/group/${groupId}`);
    },
  });

  const declineInviteMut = trpc.group.declineInvite.useMutation({
    onSuccess: invalidateGroups,
  });

  const isInviteActionPending =
    acceptInviteMut.isPending || declineInviteMut.isPending;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isGroupsRefetching || isInvitesRefetching}
            onRefresh={handlePullRefresh}
          />
        }
      >
        <ScreenTitle
          title="Groups"
          globalRs={data?.currentUserGlobalRs ?? 0}
          showRsBadge={!!data}
        />
        <View className="gap-6 pb-6">
          <GroupsButtonRow
            primaryText="Create group"
            secondaryText="Join via code"
            onPrimaryPress={() => router.push("/groups-create")}
            onSecondaryPress={() => router.push("/groups-join")}
          />

          {pendingInvites?.length ? (
            <View className="gap-2.5">
              {pendingInvites.map((invite) => (
                <GroupInviteCard
                  key={invite.membershipId}
                  invite={{
                    ...invite,
                    invitedAt: new Date(invite.invitedAt),
                  }}
                  disabled={isInviteActionPending}
                  onAccept={() =>
                    void acceptInviteMut.mutateAsync({ groupId: invite.groupId })
                  }
                  onDecline={() =>
                    void declineInviteMut.mutateAsync({ groupId: invite.groupId })
                  }
                />
              ))}
            </View>
          ) : null}

          <View className="gap-2.5">
            <SectionLabel title="Your groups" />
            <View className="gap-2.5">
              {isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator />
                </View>
              ) : data?.groups.length ? (
                data.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => router.push(`/group/${group.id}`)}
                />
                ))
              ) : (
                <View className="border-muted bg-card border px-4 py-6">
                  <AppText
                    className="text-center text-sm"
                    color="#828083"
                    weight="medium"
                  >
                    You are not in any groups yet.
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
