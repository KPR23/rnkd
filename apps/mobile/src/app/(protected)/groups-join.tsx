import { useState } from "react";
import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import {
  BackHeader,
  GroupsTextInput,
  WizardFooter,
} from "@/src/components/groups/GroupsUI";
import Screen from "@/src/components/Screen";
import { openGroupAfterWizard } from "@/src/lib/navigation/groups";
import { trpc } from "@/src/utils/trpc";

export default function GroupsJoinScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const normalizedCode = code.trim();
  const utils = trpc.useUtils();
  const joinGroup = trpc.group.joinByCode.useMutation({
    onSuccess: async ({ groupId }) => {
      await utils.group.invalidate();
      openGroupAfterWizard(router, groupId);
    },
  });

  return (
    <Screen
      footer={
        <WizardFooter
          actionText="Join group"
          disabled={!normalizedCode || joinGroup.isPending}
          onPress={() => joinGroup.mutate({ code: normalizedCode })}
        />
      }
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-6">
        <BackHeader title="Join new group" onBack={() => router.back()} />
        <GroupsTextInput
          autoCapitalize="characters"
          placeholder="Group code"
          returnKeyType="done"
          value={code}
          onChangeText={setCode}
        />
      </View>
    </Screen>
  );
}
