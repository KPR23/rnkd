import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { auth } from "../../../../lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Avatar upload is only available in development" },
      { status: 403 },
    );
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  const extension = extensionForMimeType(file.type);
  const filename = `${session.user.id}-${Date.now()}.${extension}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(
    path.join(uploadsDir, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  const origin = new URL(req.url).origin;

  return Response.json({
    url: `${origin}/uploads/avatars/${filename}`,
  });
}
