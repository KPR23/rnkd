import { useEffect, useMemo, useState } from "react";

import { useRouter } from "expo-router";

import type { GameAccount } from "@repo/types";
import { refetchAuthSession, useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";
import { pickProfileImageFromLibrary } from "@/src/lib/profile/pick-profile-image";
import { uploadAvatar } from "@/src/lib/profile/upload-avatar";
import {
  isOnboardingProfileValid,
  normalizeOnboardingTag,
  toStoredProfileImageValue,
} from "@/src/components/onboarding/onboarding-utils";
import type { OnboardingStep } from "@/src/components/onboarding/onboarding-types";
import { trpc } from "@/src/utils/trpc";

export function useOnboardingController() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showError } = useMessage();
  const { data: session, refetch: refetchSession } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("profile");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAddAccountVisible, setIsAddAccountVisible] = useState(false);

  const profileQuery = trpc.profile.getOverview.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id },
  );
  const gameAccountsQuery = trpc.gameAccount.getGameAccounts.useQuery(
    undefined,
    { enabled: !!session?.user.id },
  );

  useEffect(() => {
    const overviewUser = profileQuery.data?.user;
    const sessionUser = session?.user;

    if (!overviewUser && !sessionUser) {
      return;
    }

    setName((current) =>
      current || overviewUser?.name || sessionUser?.name || "",
    );
    setTag((current) => current || overviewUser?.tag || sessionUser?.tag || "");
    setImage(
      (current) => current ?? overviewUser?.image ?? sessionUser?.image ?? null,
    );
    setBio((current) => current || overviewUser?.bio || "");
  }, [profileQuery.data, session?.user]);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.profile.invalidate(),
        utils.group.invalidate(),
        refetchSession({ query: { disableCookieCache: true } }),
      ]);
      await refetchAuthSession();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const normalizedTag = normalizeOnboardingTag(tag);
  const profileValid = isOnboardingProfileValid(name, tag);
  const linkedAccounts = useMemo<GameAccount[]>(
    () => [
      ...(gameAccountsQuery.data?.lol ?? []),
      ...(gameAccountsQuery.data?.faceit ?? []),
    ],
    [gameAccountsQuery.data],
  );

  const saveProfileStep = async () => {
    if (!profileValid) {
      showError(
        "Add your name and a nickname with 2-32 letters, numbers, or underscores.",
      );
      return;
    }

    await updateProfile.mutateAsync({
      name: name.trim(),
      tag: normalizedTag,
    });
    setStep("details");
  };

  const pickAvatar = async () => {
    const asset = await pickProfileImageFromLibrary();

    if (!asset?.uri) {
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadAvatar(asset.uri);
      setImage(uploadedUrl);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to upload avatar.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const saveDetailsStep = async () => {
    await updateProfile.mutateAsync({
      image: toStoredProfileImageValue(image),
      bio: bio.trim() || null,
    });
    setStep("accounts");
  };

  const finishOnboarding = () => {
    router.replace("/(protected)/(tabs)");
  };

  const closeAddAccount = () => {
    setIsAddAccountVisible(false);
    void gameAccountsQuery.refetch();
  };

  return {
    bio,
    finishOnboarding,
    image,
    isAddAccountVisible,
    isFetchingGameAccounts: gameAccountsQuery.isFetching,
    isLoadingInitial: !session?.user || profileQuery.isLoading,
    isProfileSaving: updateProfile.isPending,
    isUploadingAvatar,
    linkedAccounts,
    name,
    pickAvatar,
    profileValid,
    saveDetailsStep,
    saveProfileStep,
    session,
    setBio,
    setImage,
    setIsAddAccountVisible,
    setName,
    setStep,
    setTag,
    step,
    tag,
    closeAddAccount,
  };
}
