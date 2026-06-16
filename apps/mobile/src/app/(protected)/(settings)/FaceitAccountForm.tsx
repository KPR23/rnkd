import { Text, View } from "react-native";

import { TextField } from "@/src/components/TextField";

type FaceitAccountFormProps = {
  faceitNickname: string;
  isPending: boolean;
  setFaceitNickname: (value: string) => void;
};

export default function FaceitAccountForm({
  faceitNickname,
  isPending,
  setFaceitNickname,
}: FaceitAccountFormProps) {
  return (
    <View className="border-muted bg-card border p-4">
      <Text className="font-sans-medium text-text-secondary mb-1.5 text-xs">
        Faceit nickname
      </Text>
      <TextField
        className="bg-background"
        placeholder="e.g. m0NESY"
        autoCapitalize="none"
        spellCheck={false}
        autoComplete="off"
        accessibilityLabel="Faceit nickname"
        accessibilityHint="Enter your Faceit username"
        value={faceitNickname}
        onChangeText={setFaceitNickname}
        editable={!isPending}
      />
    </View>
  );
}
