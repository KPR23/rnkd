export type OnboardingStep = "profile" | "details" | "accounts";

export type OnboardingStepDefinition = {
  id: OnboardingStep;
  label: string;
};

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  { id: "profile", label: "Profile" },
  { id: "details", label: "Details" },
  { id: "accounts", label: "Games" },
];
