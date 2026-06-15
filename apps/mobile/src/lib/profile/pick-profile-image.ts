import { Alert, Linking } from "react-native";

import * as ImagePicker from "expo-image-picker";

type PhotoLibraryPermissionResult =
  | { granted: true }
  | { granted: false; reason: "denied" | "blocked" };

export async function ensurePhotoLibraryPermission(): Promise<PhotoLibraryPermissionResult> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();

  if (current.granted) {
    return { granted: true };
  }

  if (current.status === ImagePicker.PermissionStatus.UNDETERMINED) {
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requested.granted
      ? { granted: true }
      : { granted: false, reason: "denied" };
  }

  if (current.canAskAgain) {
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requested.granted
      ? { granted: true }
      : { granted: false, reason: "denied" };
  }

  return { granted: false, reason: "blocked" };
}

export function showPhotoPermissionAlert(reason: "denied" | "blocked") {
  const message =
    reason === "blocked"
      ? "Rnkd needs access to your photo library to update your profile picture. Open Settings to allow photo access."
      : "Photo library access is required to update your profile picture.";

  if (reason === "blocked") {
    Alert.alert("Photo access required", message, [
      { text: "Not now", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ]);
    return;
  }

  Alert.alert("Photo access required", message, [{ text: "OK" }]);
}

export async function pickProfileImageFromLibrary() {
  const permission = await ensurePhotoLibraryPermission();

  if (!permission.granted) {
    showPhotoPermissionAlert(permission.reason);
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0];
}
