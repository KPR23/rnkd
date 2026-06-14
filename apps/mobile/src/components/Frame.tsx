import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function Frame({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <View
      className={`text-text bg-card border-muted flex-col items-center justify-center gap-5 border p-5 ${className ?? ""}`}
    >
      {children}
    </View>
  );
}
