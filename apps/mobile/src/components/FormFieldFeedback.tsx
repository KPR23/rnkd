import { ActivityIndicator } from "react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";

type FormFieldFeedbackProps = {
  tone: "loading" | "error" | "success";
  message?: string | null;
};

export default function FormFieldFeedback({
  tone,
  message,
}: FormFieldFeedbackProps) {
  if (tone === "loading") {
    return <ActivityIndicator color={colors.textSecondary} />;
  }

  if (!message) {
    return null;
  }

  return (
    <AppText
      className="text-sm"
      color={
        tone === "error"
          ? colors.destructiveText
          : tone === "success"
            ? colors.success
            : colors.textSecondary
      }
    >
      {message}
    </AppText>
  );
}
