import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";

import { WarningCircle } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled render error", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <View className="border-muted bg-card w-full gap-5 border p-5">
          <View className="items-center gap-3">
            <WarningCircle
              color={colors.destructiveText}
              size={42}
              weight="fill"
            />
            <AppText className="text-center text-xl" weight="medium">
              Something went wrong
            </AppText>
            <AppText
              className="text-center text-sm leading-5"
              color={colors.textSecondary}
            >
              Rnkd hit an unexpected screen error. Try again to reload this part
              of the app.
            </AppText>
          </View>

          <Button
            actionText="Try again"
            className="w-full"
            haptic="impact"
            variant="primary"
            onPress={this.handleRetry}
          />
        </View>
      </View>
    );
  }
}
