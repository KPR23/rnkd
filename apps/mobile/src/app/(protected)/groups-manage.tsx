import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  BackHeader,
  LeaderboardRow,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import { trpc } from "@/src/utils/trpc";

export default function GroupsManageScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.group.detail.useQuery(
    { groupId: groupId ?? "" },
    { enabled: !!groupId },
  );
  const removeMember = trpc.group.removeMember.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
    },
  });

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
              groupId,
              userId: member.id,
            }),
        },
      ],
    );
  };

  if (!groupId) {
    return null;
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          <BackHeader title="Manage players" centered onBack={() => router.back()} />

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
                data.members.map((member) => (
                <LeaderboardRow
                  key={member.id}
                  manage
                  member={member}
                  onRemove={() => confirmRemoveMember(member)}
                />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
