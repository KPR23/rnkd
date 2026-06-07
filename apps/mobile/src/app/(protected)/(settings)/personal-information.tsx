import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Stack, useRouter } from "expo-router";

import { GAMES } from "@repo/types";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/lib/auth/use-auth";
import { trpc } from "@/src/utils/trpc";

const REGIONS = ["EMEA", "NA", "SA", "SEA", "OCE"] as const;

export default function PersonalInformationScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session } = useAuth();

  const profileQuery = trpc.profile.getOverview.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id },
  );

  const [bio, setBio] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [favoriteGameId, setFavoriteGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileQuery.data) return;
    setBio(profileQuery.data.user.bio ?? "");
    setRegion(profileQuery.data.user.region);
    setFavoriteGameId(profileQuery.data.user.favoriteGame?.id ?? null);
  }, [profileQuery.data]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.invalidate();
      router.back();
    },
  });

  if (profileQuery.isLoading || !session?.user) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Personal information" }} />
      <ScrollView
        className="bg-background flex-1"
        contentContainerStyle={{ padding: 20, gap: 20 }}
      >
        <View className="flex flex-col gap-2">
          <Text className="text-text font-sans-semibold text-sm">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself"
            placeholderTextColor="#828083"
            multiline
            className="border-border bg-card text-text min-h-24 border p-3 font-sans text-base"
          />
        </View>

        <View className="flex flex-col gap-2">
          <Text className="text-text font-sans-semibold text-sm">Region</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {REGIONS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setRegion(item)}
                className={`rounded-full border px-4 py-2 ${
                  region === item
                    ? "border-primary bg-primary/20"
                    : "border-border bg-card"
                }`}
              >
                <Text className="text-text font-sans-medium text-sm">
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex flex-col gap-2">
          <Text className="text-text font-sans-semibold text-sm">
            Favorite game
          </Text>
          <View className="flex flex-row gap-2">
            {[
              { id: GAMES.CS2_FACEIT, label: "CS2" },
              { id: GAMES.LOL, label: "LoL" },
            ].map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => setFavoriteGameId(game.id)}
                className={`rounded-full border px-4 py-2 ${
                  favoriteGameId === game.id
                    ? "border-primary bg-primary/20"
                    : "border-border bg-card"
                }`}
              >
                <Text className="text-text font-sans-medium text-sm">
                  {game.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          variant="primary"
          actionText={updateProfile.isPending ? "Saving…" : "Save changes"}
          className="w-full"
          disabled={updateProfile.isPending}
          onPress={() =>
            void updateProfile.mutateAsync({
              bio: bio.trim() || null,
              region,
              favoriteGameId,
            })
          }
        />
      </ScrollView>
    </>
  );
}
