import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

const REQUIRED_KEYS = [
  "profile", "siteSettings", "projectCategory", "project",
  "projectImage", "projectFeature", "projectLink",
  "skillCategory", "skill", "experience", "education",
  "certification", "blogPost", "galleryItem", "contactMessage",
] as const;

function isValidBackup(payload: unknown): payload is {
  meta: { app: string; schemaVersion: number };
  data: Record<(typeof REQUIRED_KEYS)[number], unknown[]>;
} {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (!p.meta || typeof p.meta !== "object") return false;
  const meta = p.meta as Record<string, unknown>;
  if (meta.app !== "wajid-portfolio") return false;
  if (typeof meta.schemaVersion !== "number") return false;
  if (!p.data || typeof p.data !== "object") return false;
  const data = p.data as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (!Array.isArray(data[key])) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON file." }, { status: 400 });
  }

  if (!isValidBackup(payload)) {
    return NextResponse.json(
      { success: false, error: "This does not look like a valid Wajid Portfolio backup file." },
      { status: 422 }
    );
  }

  const { data } = payload;

  try {
    await prisma.$transaction(async (tx) => {
      // Delete children first (FK-safe order)
      await tx.contactMessage.deleteMany();
      await tx.galleryItem.deleteMany();
      await tx.blogPost.deleteMany();
      await tx.certification.deleteMany();
      await tx.education.deleteMany();
      await tx.experience.deleteMany();
      await tx.skill.deleteMany();
      await tx.skillCategory.deleteMany();
      await tx.projectLink.deleteMany();
      await tx.projectFeature.deleteMany();
      await tx.projectImage.deleteMany();
      await tx.project.deleteMany();
      await tx.projectCategory.deleteMany();
      await tx.siteSettings.deleteMany();
      await tx.profile.deleteMany();

      // Re-create parents first (FK-safe order)
      if (data.profile.length)         await tx.profile.createMany({ data: data.profile as never[] });
      if (data.siteSettings.length)    await tx.siteSettings.createMany({ data: data.siteSettings as never[] });
      if (data.projectCategory.length) await tx.projectCategory.createMany({ data: data.projectCategory as never[] });
      if (data.project.length)         await tx.project.createMany({ data: data.project as never[] });
      if (data.projectImage.length)    await tx.projectImage.createMany({ data: data.projectImage as never[] });
      if (data.projectFeature.length)  await tx.projectFeature.createMany({ data: data.projectFeature as never[] });
      if (data.projectLink.length)     await tx.projectLink.createMany({ data: data.projectLink as never[] });
      if (data.skillCategory.length)   await tx.skillCategory.createMany({ data: data.skillCategory as never[] });
      if (data.skill.length)           await tx.skill.createMany({ data: data.skill as never[] });
      if (data.experience.length)      await tx.experience.createMany({ data: data.experience as never[] });
      if (data.education.length)       await tx.education.createMany({ data: data.education as never[] });
      if (data.certification.length)   await tx.certification.createMany({ data: data.certification as never[] });
      if (data.blogPost.length)        await tx.blogPost.createMany({ data: data.blogPost as never[] });
      if (data.galleryItem.length)     await tx.galleryItem.createMany({ data: data.galleryItem as never[] });
      if (data.contactMessage.length)  await tx.contactMessage.createMany({ data: data.contactMessage as never[] });
    }, { timeout: 30000 });

    await logActivity(user!.id, "UPDATE", "Backup", "Restored site data from backup file", undefined, request);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("Backup restore error:", e);
    return NextResponse.json(
      { success: false, error: "Restore failed. No changes were saved (transaction rolled back)." },
      { status: 500 }
    );
  }
}