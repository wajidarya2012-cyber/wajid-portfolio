import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const settings = await prisma.siteSettings.findMany();
  return NextResponse.json({ success:true, data:settings });
}

// Only these keys may be written via this endpoint.
const ALLOWED_KEYS = new Set([
  "seo_default_title",
  "seo_default_description",
  "maintenance_mode",
  "cv_download_tracking",
]);

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ success:false, error:"Invalid payload." }, { status:422 });
  }

  const entries = Object.entries(body as Record<string, unknown>).filter(
    ([key, value]) => ALLOWED_KEYS.has(key) && typeof value === "string"
  );

  if (entries.length === 0) {
    return NextResponse.json({ success:false, error:"No valid settings provided." }, { status:422 });
  }

  const ops = entries.map(([key, value]) =>
    prisma.siteSettings.upsert({
      where:  { key },
      update: { value: value as string },
      create: { key, value: value as string, label: key, group: "general" },
    })
  );
  await prisma.$transaction(ops);
  await logActivity(user!.id, "UPDATE", "SiteSettings", "Updated site settings", undefined, request);
  return NextResponse.json({ success:true });
}
