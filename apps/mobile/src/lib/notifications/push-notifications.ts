import { useEffect } from "react";
import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { trpc } from "@/src/utils/trpc";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

async function getExpoPushToken() {
  if (Platform.OS === "web") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("friend-requests", {
      name: "Friend requests",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#B8FF4D",
    });
  }

  const permission = await Notifications.getPermissionsAsync();
  const granted =
    permission.granted ||
    (await Notifications.requestPermissionsAsync()).granted;

  if (!granted) {
    return null;
  }

  const projectId = getProjectId();

  if (!projectId) {
    console.warn("Expo projectId is required to register push notifications.");
    return null;
  }

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export function useRegisterPushNotifications(enabled: boolean) {
  const { mutateAsync: registerPushToken } =
    trpc.notifications.registerPushToken.useMutation();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const token = await getExpoPushToken();

        if (!token || cancelled) {
          return;
        }

        await registerPushToken({
          token,
          platform: Platform.OS,
        });
      } catch (error) {
        console.warn("Failed to register push notifications.", error);
      }
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, [enabled, registerPushToken]);
}
