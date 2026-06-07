import { Platform } from "react-native";

export async function copyToClipboard(text: string): Promise<boolean> {
  if (Platform.OS === "web") {
    await navigator.clipboard.writeText(text);
    return true;
  }

  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}
