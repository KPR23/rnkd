import { View } from "react-native";

import { CheckCircleIcon } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import {
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/src/components/onboarding/onboarding-types";

export default function OnboardingProgress({
  currentStep,
}: {
  currentStep: OnboardingStep;
}) {
  const currentIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <View className="flex-row gap-2">
      {ONBOARDING_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <View
            key={step.id}
            className={[
              "h-9 flex-1 flex-row items-center justify-center gap-1.5 border",
              isCurrent
                ? "border-primary bg-primary/15"
                : isComplete
                  ? "border-primary/60 bg-primary/10"
                  : "border-muted bg-card",
            ].join(" ")}
          >
            {isComplete ? (
              <CheckCircleIcon size={15} color={colors.primary} weight="fill" />
            ) : null}
            <AppText
              className="text-xs"
              weight="medium"
              color={
                isCurrent || isComplete ? colors.text : colors.textSecondary
              }
            >
              {step.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}
