import { mobileServerUrl } from "@/src/lib/server-url";

export function resolveProfileImageUrl(image: string | null | undefined) {
  if (!image) {
    return null;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${mobileServerUrl}${image.startsWith("/") ? image : `/${image}`}`;
}
