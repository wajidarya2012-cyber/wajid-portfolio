import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { uploadBuffer, uploadDocument, deleteResource } from "@/lib/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES   = ["application/pdf"];

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file     = formData.get("file") as File | null;
    const folder   = (formData.get("folder") as string) ?? "general";
    const type     = (formData.get("type")   as string) ?? "image";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = type === "document" ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: `Invalid file type: ${file.type}` }, { status: 415 });
    }

    const maxSize = type === "document" ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB doc / 5MB image
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File too large" }, { status: 413 });
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const result =
      type === "document"
        ? await uploadDocument(buffer, folder, filename)
        : await uploadBuffer(buffer, folder, filename);

    await logActivity(user!.id, "UPLOAD", "File", `Uploaded ${type}: ${filename}`, undefined, request);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { publicId, resourceType } = await request.json();
  if (!publicId) {
    return NextResponse.json({ success: false, error: "publicId required" }, { status: 400 });
  }

  await deleteResource(publicId, resourceType ?? "image");
  await logActivity(user!.id, "DELETE", "File", `Deleted file: ${publicId}`, undefined, request);

  return NextResponse.json({ success: true });
}
