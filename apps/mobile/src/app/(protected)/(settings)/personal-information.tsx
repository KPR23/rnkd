import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
} from "react-native";

import { Stack, useRouter } from "expo-router";
import { ArrowsClockwiseIcon } from "phosphor-react-native";

import { User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { HeaderBar } from "@/src/components/Header";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import EditableProfileRow from "@/src/components/settings/EditableProfileRow";
import EditProfileFieldModal from "@/src/components/settings/EditProfileFieldModal";
import SocialAccountCard from "@/src/components/settings/SocialAccountCard";
import UserProfileImage from "@/src/components/UserProfileImage";
import { useAuthAccounts } from "@/src/lib/auth/use-auth-accounts";
import { refetchAuthSession, useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";
import { pickProfileImageFromLibrary } from "@/src/lib/profile/pick-profile-image";
import { uploadAvatarLocalDev } from "@/src/lib/profile/upload-avatar-local-dev";
import { trpc } from "@/src/utils/trpc";
import { mobileServerUrl } from "@/src/lib/server-url";

type EditableField = "name" | "tag" | null;

function formatNickname(tag: string | null | undefined) {
  if (!tag) {
    return "Add nickname";
  }

  return tag.startsWith("@") ? tag : `@${tag}`;
}

function ProfileAvatar({
  user,
  isUploading,
  onPress,
}: {
  user: Pick<User, "name" | "image">;
  isUploading: boolean;
  onPress: () => void;
}) {
  return (
    <View className="items-center">
      <View className="relative">
        <UserProfileImage user={user as User} size={76} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={isUploading}
          onPress={onPress}
          className="bg-primary absolute -right-1 bottom-0 h-7 w-7 items-center justify-center rounded-full"
        >
          {isUploading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <ArrowsClockwiseIcon size={16} color={colors.text} weight="bold" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function toStoredImageValue(image: string | null) {
  if (!image) {
    return null;
  }

  const normalizedServerUrl = mobileServerUrl.replace(/\/+$/, "");
  if (image.startsWith(`${normalizedServerUrl}/`)) {
    return image.slice(normalizedServerUrl.length);
  }

  return image;
}

export default function PersonalInformationScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const { data: session, refetch: refetchSession } = useAuth();
  const {
    accounts,
    error: authAccountsError,
    getProviderLabel,
    isLoading: isAuthAccountsLoading,
  } = useAuthAccounts();

  const profileQuery = trpc.profile.getOverview.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id },
  );

  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<EditableField>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!profileQuery.data && !session?.user) {
      return;
    }

    const overviewUser = profileQuery.data?.user;
    setName(overviewUser?.name ?? session?.user.name ?? "");
    setTag(overviewUser?.tag ?? session?.user.tag ?? "");
    setImage(overviewUser?.image ?? session?.user.image ?? null);
  }, [profileQuery.data, session?.user]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.invalidate();
      await refetchSession({ query: { disableCookieCache: true } });
      await refetchAuthSession();
      router.back();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const initialValues = useMemo(() => {
    const overviewUser = profileQuery.data?.user;

    return {
      name: overviewUser?.name ?? session?.user.name ?? "",
      tag: overviewUser?.tag ?? session?.user.tag ?? "",
      image: overviewUser?.image ?? session?.user.image ?? null,
    };
  }, [profileQuery.data, session?.user]);

  const isDirty =
    name.trim() !== initialValues.name.trim() ||
    tag.trim() !== (initialValues.tag ?? "").trim() ||
    image !== initialValues.image;

  const canSave =
    isDirty &&
    name.trim().length > 0 &&
    !updateProfile.isPending &&
    !isUploadingAvatar;

  const handlePickAvatar = async () => {
    const asset = await pickProfileImageFromLibrary();

    if (!asset?.uri) {
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadAvatarLocalDev(asset.uri);
      setImage(uploadedUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload avatar.";
      showError(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const normalizedTag = tag.trim().replace(/^@+/, "");

    await updateProfile.mutateAsync({
      name: name.trim(),
      tag: normalizedTag.length > 0 ? normalizedTag : null,
      image: toStoredImageValue(image),
    });
  };

  if (profileQuery.isLoading || !session?.user) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const avatarUser = {
    name,
    image,
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        footer={
          <ScreenFooter
            loading={updateProfile.isPending}
            primaryAction={{
              text: "Save changes",
              disabled: !canSave,
              onPress: () => void handleSave(),
            }}
          />
        }
      >
        <ScreenScroll header={<HeaderBar variant="centered" title="Edit profile" />}>
          <View className="gap-6">
            <ProfileAvatar
              user={avatarUser}
              isUploading={isUploadingAvatar}
              onPress={() => void handlePickAvatar()}
            />

            <View className="gap-3">
              <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
                Personal information
              </AppText>
              <View className="gap-2">
                <EditableProfileRow
                  label="Name"
                  value={name.trim() || "Add name"}
                  onPress={() => setActiveField("name")}
                />
                <EditableProfileRow
                  label="Nickname"
                  value={formatNickname(tag)}
                  onPress={() => setActiveField("tag")}
                />
                <EditableProfileRow
                  label="E-mail"
                  value={session.user.email}
                  disabled
                />
              </View>
            </View>

            <View className="gap-3">
              <AppText className="text-sm" weight="medium" color={colors.textSecondary}>
                Social accounts
              </AppText>
              {isAuthAccountsLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator />
                </View>
              ) : authAccountsError ? (
                <AppText className="text-sm" color={colors.textSecondary}>
                  {authAccountsError}
                </AppText>
              ) : accounts.length === 0 ? (
                <AppText className="text-sm" color={colors.textSecondary}>
                  No connected social accounts yet.
                </AppText>
              ) : (
                <View className="gap-2">
                  {accounts.map((account) => (
                    <SocialAccountCard
                      key={account.id}
                      providerLabel={getProviderLabel(account.providerId)}
                      description={`Connected to ${session.user.email}`}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScreenScroll>
      </Screen>

      <EditProfileFieldModal
        visible={activeField === "name"}
        title="Name"
        label="Name"
        value={name}
        placeholder="Your name"
        maxLength={64}
        onClose={() => setActiveField(null)}
        onSave={setName}
      />

      <EditProfileFieldModal
        visible={activeField === "tag"}
        title="Nickname"
        label="Nickname"
        value={tag.replace(/^@+/, "")}
        placeholder="your_nickname"
        prefix="@"
        maxLength={32}
        onClose={() => setActiveField(null)}
        onSave={setTag}
      />
    </>
  );
}
