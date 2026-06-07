import { useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import {
  BackHeader,
  GroupsTextInput,
  WizardFooter,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";

export default function GroupsCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const normalizedGroupName = groupName.trim();

  return (
    <Screen
      footer={
        <WizardFooter
          actionText="Continue"
          disabled={!normalizedGroupName}
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
        <GroupsTextInput
          autoCapitalize="words"
          placeholder="Group Name"
          returnKeyType="next"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>
    </Screen>
  );
}
