import { NextRequest, NextResponse } from "next/server";
import { prisma }   from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const profile = await prisma.profile.findFirst();
  return NextResponse.json({ success:true, data:profile });
}

// Explicit allowlist of writable Profile fields.
// Prevents clients from injecting arbitrary keys (e.g. id) into the update.
const WRITABLE_FIELDS = [
  "fullName_en", "fullName_ps", "fullName_fa",
  "title_en", "title_ps", "title_fa",
  "bio_en", "bio_ps", "bio_fa",
  "aboutText_en", "aboutText_ps", "aboutText_fa",
  "email", "phone", "location",
  "photoUrl", "photoPublicId",
  "cvUrl", "cvPublicId",
  "linkedinUrl", "githubUrl", "twitterUrl", "websiteUrl",
  "availableText_en", "availableText_ps", "availableText_fa",
  "heroGreeting_en", "heroGreeting_ps", "heroGreeting_fa",
  "heroCtaPrimaryText_en", "heroCtaPrimaryText_ps", "heroCtaPrimaryText_fa", "heroCtaPrimaryUrl",
  "heroCtaSecondaryText_en", "heroCtaSecondaryText_ps", "heroCtaSecondaryText_fa", "heroCtaSecondaryUrl",
  "heroRoles", "heroTechTags", "heroVisibility",
  "aboutTitle_en", "aboutTitle_ps", "aboutTitle_fa",
  "aboutSubtitle_en", "aboutSubtitle_ps", "aboutSubtitle_fa",
  "signatureUrl", "signaturePublicId",
  "aboutCvBtnText_en", "aboutCvBtnText_ps", "aboutCvBtnText_fa",
  "aboutVisibility",
  "badgeTitle_en", "badgeTitle_ps", "badgeTitle_fa",
  "badgeSub_en", "badgeSub_ps", "badgeSub_fa",
  "yearsExperience", "projectsCount",
  "education_en", "education_ps", "education_fa",
  "specialization_en", "specialization_ps", "specialization_fa",
  "languages_en", "languages_ps", "languages_fa",
  "coreValues",
  "footerTagline_en", "footerTagline_ps", "footerTagline_fa",
  "certificationsCount", "organizationsCount",
  "loginBrandName", "loginSubtitle", "loginFooterNote",
  "footerRights_en", "footerRights_ps", "footerRights_fa",
  "footerBuiltWith_en", "footerBuiltWith_ps", "footerBuiltWith_fa",
] as const;

function pickWritable(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of WRITABLE_FIELDS) {
    if (key in body) out[key] = body[key];
  }
  return out;
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();

  if (!body.email || !body.fullName_en) {
    return NextResponse.json({ success:false, error:"Email and English name are required." }, { status:422 });
  }

  const data = pickWritable(body);

  try {
    const existing = await prisma.profile.findFirst();
    const profile  = existing
      ? await prisma.profile.update({ where:{ id:existing.id }, data })
      : await prisma.profile.create({ data: data as Parameters<typeof prisma.profile.create>[0]["data"] });

    await logActivity(user!.id, "UPDATE", "Profile", "Updated profile information", profile.id, request);
    return NextResponse.json({ success:true, data:profile });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Database error";
    console.error("Profile update error:", e);
    return NextResponse.json({ success:false, error:message }, { status:500 });
  }
}
