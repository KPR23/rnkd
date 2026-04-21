import { Text, TextInput, View } from "react-native";

import { colors } from "@repo/ui/colors";

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
    <View>
      <Text className="font-sans-medium text-text-secondary mb-1.5 text-xs">
        Faceit nickname
      </Text>
      <TextInput
        placeholder="e.g. m0NESY"
        placeholderTextColor={colors.gray}
        className="border-border bg-card text-text border px-3 py-3"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        value={faceitNickname}
        onChangeText={setFaceitNickname}
        editable={!isPending}
      />
    </View>
  );
}
