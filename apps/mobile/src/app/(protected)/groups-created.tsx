import { ActivityIndicator, View } from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import {
  GroupCard,
  SectionLabel,
  WizardFooter,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
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
        <WizardFooter
          actionText="View group"
          step={3}
          totalSteps={3}
          onPress={handleViewGroup}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-6">
        <View className="gap-2 pt-18">
          <AppText className="text-[28px] leading-8" weight="medium">
            You're all set!
          </AppText>
          <AppText className="text-base leading-5" color="#828083">
            Your group has been created and invitations have been sent
          </AppText>
        </View>

        <View className="gap-2.5">
          <SectionLabel title="Created group" />
          {isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator />
            </View>
          ) : data ? (
            <GroupCard group={data.group} />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
