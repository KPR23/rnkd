import { authClient } from "@/src/lib/auth/auth-client";
import { mobileServerUrl } from "@/src/lib/server-url";

type UploadAvatarResponse = {
  url?: string;
  error?: string;
};

function mimeTypeForUri(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "image/jpeg";
  }
}

export async function uploadAvatarLocalDev(uri: string) {
  const formData = new FormData();
  const filename = uri.split("/").pop() ?? "avatar.jpg";

  formData.append("file", {
    uri,
    name: filename,
    type: mimeTypeForUri(uri),
  } as unknown as Blob);

  const cookies = authClient.getCookie();
  const response = await fetch(`${mobileServerUrl}/api/uploads/avatar`, {
    method: "POST",
    headers: cookies ? { Cookie: cookies } : {},
    body: formData,
  });

  const body = (await response.json().catch(() => ({}))) as UploadAvatarResponse;

  if (!response.ok) {
    throw new Error(body.error ?? "Failed to upload avatar");
  }

  if (!body.url) {
    throw new Error("Upload did not return an image URL");
  }

  return body.url;
}
