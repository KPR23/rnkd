import { Platform } from "react-native";

export async function copyToClipboard(text: string): Promise<boolean> {
  if (Platform.OS === "web") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
