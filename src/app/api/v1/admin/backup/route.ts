import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

// Content models only. Deliberately excludes:
// - User (password hashes â€” never expose in a downloadable file)
// - VisitorAnalytics (large, non-content, not meaningful to restore)
// - ActivityLog (system audit trail â€” restoring it would corrupt history)
export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const [
      profile,
      siteSettings,
      projectCategory,
      project,
      projectImage,
      projectFeature,
      projectLink,
      skillCategory,
      skill,
      experience,
      education,
      certification,
      blogPost,
      galleryItem,
      contactMessage,
    ] = await Promise.all([
      prisma.profile.findMany(),
      prisma.siteSettings.findMany(),
      prisma.projectCategory.findMany(),
      prisma.project.findMany(),
      prisma.projectImage.findMany(),
      prisma.projectFeature.findMany(),
      prisma.projectLink.findMany(),
      prisma.skillCategory.findMany(),
      prisma.skill.findMany(),
      prisma.experience.findMany(),
      prisma.education.findMany(),
      prisma.certification.findMany(),
      prisma.blogPost.findMany(),
      prisma.galleryItem.findMany(),
      prisma.contactMessage.findMany(),
    ]);

    const backup = {
      meta: {
        app: "wajid-portfolio",
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
      },
      data: {
        profile,
        siteSettings,
        projectCategory,
        project,
        projectImage,
        projectFeature,
        projectLink,
        skillCategory,
        skill,
        experience,
        education,
        certification,
        blogPost,
        galleryItem,
        contactMessage,
      },
    };

    await logActivity(user!.id, "CREATE", "Backup", "Exported full site backup", undefined, request);

    const filename = `wajid-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    console.error("Backup export error:", e);
    return NextResponse.json({ success: false, error: "Failed to generate backup." }, { status: 500 });
  }
}