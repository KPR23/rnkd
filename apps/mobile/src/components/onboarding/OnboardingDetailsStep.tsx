import { ActivityIndicator, Pressable, View } from "react-native";

import { CameraIcon } from "phosphor-react-native";

import type { User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import { TextFieldMultiline } from "@/src/components/TextField";
import UserProfileImage from "@/src/components/UserProfileImage";

export default function OnboardingDetailsStep({
  user,
  bio,
  image,
  isUploadingAvatar,
  onBioChange,
  onPickAvatar,
}: {
  user: User;
  bio: string;
  image: string | null;
  isUploadingAvatar: boolean;
  onBioChange: (value: string) => void;
  onPickAvatar: () => void;
}) {
  return (
    <View className="gap-5">
      <View className="items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add avatar"
          disabled={isUploadingAvatar}
          onPress={onPickAvatar}
          className="relative"
        >
          <UserProfileImage user={{ ...user, image }} size={96} />
          <View className="bg-primary absolute -right-1 bottom-1 size-8 items-center justify-center rounded-full">
            {isUploadingAvatar ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <CameraIcon size={17} color={colors.text} weight="bold" />
            )}
          </View>
        </Pressable>
        <Button
          variant="secondary"
          actionText={image ? "Change avatar" : "Add avatar"}
          className="h-10 px-5"
          disabled={isUploadingAvatar}
          onPress={onPickAvatar}
        />
      </View>
      <View className="gap-2">
        <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
          Bio
        </AppText>
        <TextFieldMultiline
          value={bio}
          placeholder="Tell others what you play, your role, or what kind of teammates you like."
          maxLength={500}
          className="min-h-34"
          onChangeText={onBioChange}
        />
      </View>
    </View>
  );
}
