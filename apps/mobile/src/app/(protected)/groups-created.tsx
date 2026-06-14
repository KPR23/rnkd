import { ActivityIndicator, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import AppText from "@/src/components/AppText";
import {
  GroupCard,
  InviteCodeCard,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { openGroupAfterWizard } from "@/src/lib/navigation/groups";
import { trpc } from "@/src/utils/trpc";

export default function GroupsCreatedScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{
    groupId?: string;
  }>();
  const { data, isLoading } = trpc.group.detail.useQuery(
    { groupId: groupId ?? "" },
    { enabled: !!groupId },
  );

  if (!groupId) {
    return null;
  }

  const handleViewGroup = () => {
    openGroupAfterWizard(router, groupId);
  };

  return (
    <Screen
      footer={
        <ScreenFooter
          primaryAction={{
            text: "View group",
            onPress: handleViewGroup,
          }}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-6">
        <View className="gap-2 pt-18">
          <AppText className="text-[28px] leading-8" weight="medium">
            You&apos;re all set!
          </AppText>
          <AppText className="text-base leading-5" color="#828083">
            Your group has been created. Share the invite code below so others
            can request to join.
          </AppText>
        </View>

        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator />
          </View>
        ) : data ? (
          <>
            <InviteCodeCard inviteCode={data.group.inviteCode} />
            <View className="gap-2.5">
              <SectionLabel title="Created group" />
              <GroupCard group={data.group} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
