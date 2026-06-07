import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  BackHeader,
  GroupsButtonRow,
  LeaderboardRow,
  RatingSummaryCard,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import { goBackFromGroup } from "@/src/lib/navigation/groups";
import { trpc } from "@/src/utils/trpc";

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id, returnTo } = useLocalSearchParams<{
    id: string;
    returnTo?: string;
  }>();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.group.detail.useQuery(
    { groupId: id ?? "" },
    { enabled: !!id },
  );
  const leaveGroup = trpc.group.leave.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
      goBackFromGroup(router, returnTo);
    },
  });

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const confirmLeaveGroup = () => {
    Alert.alert(
      "Leave group",
      `Are you sure you want to leave ${data?.group.name ?? "this group"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => leaveGroup.mutate({ groupId: id }),
        },
      ],
    );
  };

  if (isError || !data) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <AppText className="text-center text-sm" color="#828083">
            Group not found.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          <BackHeader
            title={data.group.name}
            centered
            onBack={() => goBackFromGroup(router, returnTo)}
          />

          <View className="gap-3">
            <RatingSummaryCard
              rating={data.currentUserRating}
              position={data.currentUserPosition}
            />
            <GroupsButtonRow
              primaryText="Invite"
              secondaryText={
                data.canManage ? "Manage players" : "Leave group"
              }
              onPrimaryPress={() =>
                router.push({
                  pathname: "/groups-invite",
                  params: {
                    mode: "invite",
                    groupId: data.group.id,
                    groupName: data.group.name,
                  },
                })
              }
              onSecondaryPress={
                data.canManage
                  ? () =>
                      router.push({
                        pathname: "/groups-manage",
                        params: { groupId: data.group.id },
                      })
                  : confirmLeaveGroup
              }
            />
          </View>

          <View className="gap-2.5">
            <SectionLabel title="Leaderboard" />
            <View className="gap-2">
              {data.members.map((member) => (
                <LeaderboardRow key={member.id} member={member} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
