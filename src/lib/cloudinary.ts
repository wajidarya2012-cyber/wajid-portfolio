import { v2 as cloudinary } from "cloudinary";

// Configured lazily (per-call) rather than once at import time, so a missing/
// invalid credential produces a clear, actionable error instead of Cloudinary
// silently receiving `undefined` values (which previously surfaced only as a
// generic "Upload failed").
function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key    = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must all be set in .env (and the dev/deployment server restarted after editing it)."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

export interface UploadResult {
  url:       string;
  publicId:  string;
  width?:    number;
  height?:   number;
  format?:   string;
  bytes?:    number;
}

// ── Upload from base64 data URI or remote URL ──────────────────────────────
export async function uploadImage(
  source: string,
  folder: string,
  options?: Record<string, unknown>
): Promise<UploadResult> {
  configureCloudinary();
  const result = await cloudinary.uploader.upload(source, {
    folder:         `wajid-portfolio/${folder}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
    ...options,
  });
  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    format:   result.format,
    bytes:    result.bytes,
  };
}

// ── Upload a raw Buffer ────────────────────────────────────────────────────
export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  filename?: string,
  options?: Record<string, unknown>
): Promise<UploadResult> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:         `wajid-portfolio/${folder}`,
        public_id:      filename,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
          bytes:    result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

// ── Upload a document/CV (PDF, DOCX) ──────────────────────────────────────
// Cloudinary restricts delivery of "raw" PDFs by default for security
// (returns "Failed to load PDF document"). Uploading PDFs as resource_type
// "image" bypasses that restriction since Cloudinary can render PDF pages
// as images, and the secure_url still serves the original file correctly
// with a .pdf extension so browsers/PDF viewers open it normally.
export async function uploadDocument(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  // Strip any existing extension — Cloudinary appends the correct one
  // automatically based on the `format` option below.
  const baseName = filename.replace(/\.[^/.]+$/, "");
  return uploadBuffer(buffer, folder, baseName, {
    resource_type: "image",
    format:        "pdf",
  });
}

// ── Delete by public_id ────────────────────────────────────────────────────
export async function deleteResource(
  publicId:     string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
