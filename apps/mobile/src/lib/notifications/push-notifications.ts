import { useEffect } from "react";
import { Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

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

  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("social", {
      name: "Social",
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
  const router = useRouter();
  const utils = trpc.useUtils();
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

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (
          data.type === "friend_request" &&
          typeof data.requesterUserId === "string"
        ) {
          void utils.friend.relationship.invalidate({
            userId: data.requesterUserId,
          });
          router.push(`/player/${data.requesterUserId}`);
          return;
        }

        if (data.type === "group_invite") {
          void utils.group.pendingInvites.invalidate();
          void utils.group.list.invalidate();
          router.push("/groups");
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [
    enabled,
    router,
    utils.friend.relationship,
    utils.group.list,
    utils.group.pendingInvites,
  ]);
}
