import { Text, TouchableOpacity, View } from "react-native";

import {
  RIOT_PLATFORM_LABEL,
  RIOT_PLATFORM_ROUTE,
  type RiotPlatformRoute,
} from "@repo/types";
import { TextField } from "@/src/components/TextField";

type LolAccountFormProps = {
  gameName: string;
  tagLine: string;
  platform: RiotPlatformRoute;
  isPending: boolean;
  setGameName: (value: string) => void;
  setTagLine: (value: string) => void;
  setPlatform: (value: RiotPlatformRoute) => void;
};

export default function LolAccountForm({
  gameName,
  tagLine,
  platform,
  isPending,
  setGameName,
  setTagLine,
  setPlatform,
}: LolAccountFormProps) {
  return (
    <View className="flex flex-col gap-3">
      <View>
        <Text className="font-sans-medium text-text-secondary mb-1.5 text-xs">
          Summoner name
        </Text>
        <TextField
          className="bg-card"
          placeholder="e.g. Faker"
          autoCapitalize="none"
          spellCheck={false}
          autoComplete="off"
          accessibilityLabel="Summoner name"
          accessibilityHint="Enter your Riot summoner name, 3 to 16 characters"
          maxLength={16}
          returnKeyType="next"
          value={gameName}
          onChangeText={setGameName}
          editable={!isPending}
        />
      </View>
      <View>
        <Text className="font-sans-medium text-text-secondary mb-1.5 text-xs">
          Tag line
        </Text>
        <TextField
          className="bg-card"
          placeholder="e.g. KR1"
          autoCapitalize="none"
          spellCheck={false}
          autoComplete="off"
          accessibilityLabel="Riot tag line"
          accessibilityHint="Enter your Riot tag line, 3 to 5 letters or numbers"
          maxLength={5}
          returnKeyType="done"
          value={tagLine}
          onChangeText={(value) =>
            setTagLine(value.trim().replace(/[^a-zA-Z0-9]/g, ""))
          }
          editable={!isPending}
        />
      </View>
      <View>
        <Text className="font-sans-medium text-text-secondary mb-1.5 text-xs">
          Platform
        </Text>
        <View className="flex flex-row flex-wrap gap-2">
          {RIOT_PLATFORM_ROUTE.map((p) => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.7}
              disabled={isPending}
              onPress={() => setPlatform(p)}
              accessibilityRole="button"
              accessibilityState={{
                selected: platform === p,
                disabled: isPending,
              }}
              accessibilityLabel={RIOT_PLATFORM_LABEL[p]}
              accessibilityHint="Select platform"
              className={`border px-3 py-2 ${
                platform === p
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <Text
                className={`font-sans-medium text-xs ${
                  platform === p ? "text-text" : "text-text-secondary"
                }`}
              >
                {RIOT_PLATFORM_LABEL[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
