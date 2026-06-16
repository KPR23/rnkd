import { ActivityIndicator, View } from "react-native";

import { Stack } from "expo-router";

import AddLinkedAccountModal from "@/src/app/(protected)/(settings)/AddLinkedAccountModal";
import Screen from "@/src/components/Screen";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import ScreenScroll from "@/src/components/ScreenScroll";
import OnboardingAccountsStep from "@/src/components/onboarding/OnboardingAccountsStep";
import OnboardingDetailsStep from "@/src/components/onboarding/OnboardingDetailsStep";
import OnboardingHeader from "@/src/components/onboarding/OnboardingHeader";
import OnboardingProfileStep from "@/src/components/onboarding/OnboardingProfileStep";
import OnboardingProgress from "@/src/components/onboarding/OnboardingProgress";
import { useOnboardingController } from "@/src/components/onboarding/useOnboardingController";
import { colors } from "@repo/ui/colors";

export default function OnboardingScreen() {
  const onboarding = useOnboardingController();

  if (onboarding.isLoadingInitial || !onboarding.session?.user) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const footer =
    onboarding.step === "profile" ? (
      <ScreenFooter
        loading={onboarding.isProfileSaving}
        primaryAction={{
          text: "Continue",
          disabled: !onboarding.profileValid || onboarding.isProfileSaving,
          onPress: () => void onboarding.saveProfileStep(),
        }}
      />
    ) : onboarding.step === "details" ? (
      <ScreenFooter
        loading={onboarding.isProfileSaving || onboarding.isUploadingAvatar}
        primaryAction={{
          text: "Continue",
          disabled:
            onboarding.isProfileSaving || onboarding.isUploadingAvatar,
          onPress: () => void onboarding.saveDetailsStep(),
        }}
        secondaryAction={{
          text: "Back",
          disabled:
            onboarding.isProfileSaving || onboarding.isUploadingAvatar,
          onPress: () => onboarding.setStep("profile"),
        }}
      />
    ) : (
      <ScreenFooter
        loading={onboarding.isFetchingGameAccounts}
        primaryAction={{
          text:
            onboarding.linkedAccounts.length > 0
              ? "Finish"
              : "Add game account",
          onPress:
            onboarding.linkedAccounts.length > 0
              ? onboarding.finishOnboarding
              : () => onboarding.setIsAddAccountVisible(true),
        }}
        secondaryAction={{
          text: onboarding.linkedAccounts.length > 0 ? "Add another" : "Skip",
          onPress:
            onboarding.linkedAccounts.length > 0
              ? () => onboarding.setIsAddAccountVisible(true)
              : onboarding.finishOnboarding,
        }}
      />
    );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen safeAreaEdges={["top", "bottom"]} footer={footer}>
        <ScreenScroll header={null}>
          <View className="gap-6 pt-4">
            <OnboardingHeader />
            <OnboardingProgress currentStep={onboarding.step} />

            {onboarding.step === "profile" ? (
              <OnboardingProfileStep
                name={onboarding.name}
                tag={onboarding.tag}
                onNameChange={onboarding.setName}
                onTagChange={onboarding.setTag}
              />
            ) : null}

            {onboarding.step === "details" ? (
              <OnboardingDetailsStep
                user={{
                  ...onboarding.session.user,
                  name:
                    onboarding.name.trim() || onboarding.session.user.name,
                }}
                bio={onboarding.bio}
                image={onboarding.image}
                isUploadingAvatar={onboarding.isUploadingAvatar}
                onBioChange={onboarding.setBio}
                onPickAvatar={() => void onboarding.pickAvatar()}
              />
            ) : null}

            {onboarding.step === "accounts" ? (
              <OnboardingAccountsStep
                linkedAccounts={onboarding.linkedAccounts}
              />
            ) : null}
          </View>
        </ScreenScroll>
      </Screen>

      <AddLinkedAccountModal
        visible={onboarding.isAddAccountVisible}
        onClose={onboarding.closeAddAccount}
      />
    </>
  );
}
