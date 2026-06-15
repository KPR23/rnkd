import { genUploader } from "uploadthing/client";

import { authClient } from "@/src/lib/auth/auth-client";
import { mobileServerUrl } from "@/src/lib/server-url";

type UploadThingFile = File & { uri: string };
type UploadedAvatarFile = {
  ufsUrl?: string;
  url?: string;
};

const { uploadFiles } = genUploader({
  url: `${mobileServerUrl}/api/uploadthing`,
  fetch: (input, init) => {
    const url = input.toString();

    if (!url.startsWith(mobileServerUrl)) {
      return fetch(input, init);
    }

    const cookies = authClient.getCookie();
    const headers = new Headers(init?.headers);
    if (cookies) {
      headers.set("Cookie", cookies);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  },
});

export function uploadAvatarFiles(files: UploadThingFile[]) {
  return uploadFiles("avatarUploader", { files }) as Promise<
    UploadedAvatarFile[]
  >;
}
