import { uploadAvatarFiles } from "@/src/lib/uploadthing";

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

export async function uploadAvatar(uri: string) {
  const filename = uri.split("/").pop() ?? "avatar.jpg";
  const blob = await fetch(uri).then((response) => response.blob());
  const file = Object.assign(
    new File([blob], filename, { type: mimeTypeForUri(uri) }),
    { uri },
  );

  const uploads = await uploadAvatarFiles([file]);
  const uploaded = uploads[0];
  const url = uploaded?.ufsUrl ?? uploaded?.url;

  if (!url) {
    throw new Error("UploadThing did not return an image URL");
  }

  return url;
}
