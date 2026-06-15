import { Platform } from "react-native";

import * as Haptics from "expo-haptics";

const isSupported = Platform.OS !== "web";

async function run(fn: () => Promise<void>) {
  if (!isSupported) return;
  try {
    await fn();
  } catch {}
}

export const haptics = {
  tap: () => run(() => Haptics.selectionAsync()),
  success: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  warning: () =>
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
  impact: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
};
