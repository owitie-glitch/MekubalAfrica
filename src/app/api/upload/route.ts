import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";

// Only these are accepted, and the extension is derived from the type we
// verified — never from the filename the browser sent, which is attacker
// controlled and can contain path separators.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_BYTES = 8 * 1024 * 1024;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  // Not requireRole(): that redirects, which is right for a page but useless
  // to a fetch() caller. An API answers with a status it can act on.
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const files = form?.getAll("files").filter((f): f is File => f instanceof File);

  if (!files?.length) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: `${file.name}: only JPG, PNG, WebP and AVIF are accepted.` },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `${file.name} is larger than 8MB.` },
        { status: 413 },
      );
    }

    // A phone photo is often 4-8MB and 4000px wide. Serving that raw would
    // dominate page weight, so everything is normalised to a sane web size —
    // .rotate() first, since EXIF orientation is otherwise lost on resize.
    const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
    const optimised = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();

    await writeFile(path.join(UPLOAD_DIR, name), optimised);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
