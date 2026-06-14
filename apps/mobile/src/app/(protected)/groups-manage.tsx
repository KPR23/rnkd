import { ActivityIndicator, Alert, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import AppText from "@/src/components/AppText";
import {
  BackHeader,
  LeaderboardRow,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

export default function GroupsManageScreen() {
  const router = useRouter();
  const { showError } = useMessage();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { data: session } = useAuth();
  const utils = trpc.useUtils();
  const currentUserId = session?.user?.id;
  const { data, isLoading, isError } = trpc.group.detail.useQuery(
    { groupId: groupId ?? "" },
    { enabled: !!groupId },
  );
  const approveMember = trpc.group.approveMember.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
    },
    onError: (error) => {
      showError(error.message);
    },
  });
  const removeMember = trpc.group.removeMember.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  if (!groupId) {
    return null;
  }

  const confirmRemoveMember = (member: { id: string; name: string }) => {
    Alert.alert(
      "Remove player",
      `Are you sure you want to remove ${member.name} from the group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeMember.mutate({
              groupId: groupId!,
              userId: member.id,
            }),
        },
      ],
    );
  };

  const confirmDeclineMember = (member: { id: string; name: string }) => {
    Alert.alert(
      "Decline request",
      `Are you sure you want to decline ${member.name}'s request to join?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () =>
            removeMember.mutate({
              groupId,
              userId: member.id,
            }),
        },
      ],
    );
  };

  const pendingMembers =
    data?.members.filter((member) => member.status === "invited") ?? [];
  const activeMembers =
    data?.members.filter((member) => member.status === "active") ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenScroll
        header={
          <BackHeader
            title="Manage players"
            centered
            onBack={() => router.back()}
          />
        }
      >
        <View className="gap-2.5">
            <SectionLabel title={data?.group.name ?? "Group"} />
            <View className="gap-2">
              {isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator />
                </View>
              ) : isError || !data ? (
                <View className="border-muted bg-card border px-4 py-6">
                  <AppText className="text-center text-sm" color="#828083">
                    Could not load group members.
                  </AppText>
                </View>
              ) : (
                <>
                  {pendingMembers.length ? (
                    <View className="gap-2">
                      <SectionLabel title="Pending requests" />
                      {pendingMembers.map((member) => (
                        <LeaderboardRow
                          key={member.id}
                          manage
                          isCurrentUser={member.id === currentUserId}
                          member={member}
                          onProfilePress={() =>
                            router.push(`/player/${member.id}`)
                          }
                          onAccept={() => {
                            approveMember.mutate({
                              groupId,
                              userId: member.id,
                            });
                          }}
                          onDecline={() => confirmDeclineMember(member)}
                        />
                      ))}
                    </View>
                  ) : null}
                  {activeMembers.map((member) => (
                    <LeaderboardRow
                      key={member.id}
                      manage
                      isCurrentUser={member.id === currentUserId}
                      member={member}
                      onProfilePress={() => router.push(`/player/${member.id}`)}
                      onRemove={() => confirmRemoveMember(member)}
                    />
                  ))}
                </>
              )}
            </View>
          </View>
      </ScreenScroll>
    </Screen>
  );
}
