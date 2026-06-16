import { mobileServerUrl } from "@/src/lib/server-url";

const TAG_PATTERN = /^[a-zA-Z0-9_]{2,32}$/;

export function normalizeOnboardingTag(tag: string) {
  return tag.trim().replace(/^@+/, "");
}

export function isOnboardingProfileValid(name: string, tag: string) {
  return (
    name.trim().length > 0 && TAG_PATTERN.test(normalizeOnboardingTag(tag))
  );
}

export function toStoredProfileImageValue(image: string | null) {
  if (!image) {
    return null;
  }

  const normalizedServerUrl = mobileServerUrl.replace(/\/+$/, "");
  if (image.startsWith(`${normalizedServerUrl}/`)) {
    return image.slice(normalizedServerUrl.length);
  }

  return image;
}
