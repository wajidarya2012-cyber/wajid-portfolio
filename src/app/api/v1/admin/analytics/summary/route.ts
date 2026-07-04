import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days  = parseInt(searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // groupBy cannot run inside $transaction([...]) array form — run separately.
  const sessionsResult = await prisma.visitorAnalytics.groupBy({
    by:    ["sessionId"],
    where: { createdAt: { gte: since } },
  });
  const uniqueSessions = sessionsResult.length;

  const [
    totalPageViews,
    cvDownloads,
    contactSubmits,
    newMessages,
    totalProjects,
    publishedPosts,
    galleryItems,
  ] = await prisma.$transaction([
    prisma.visitorAnalytics.count({ where: { event: "PAGE_VIEW",       createdAt: { gte: since } } }),
    prisma.visitorAnalytics.count({ where: { event: "CV_DOWNLOAD",    createdAt: { gte: since } } }),
    prisma.visitorAnalytics.count({ where: { event: "CONTACT_SUBMIT", createdAt: { gte: since } } }),
    prisma.contactMessage.count({   where: { status: "NEW" } }),
    prisma.project.count({          where: { status: "ACTIVE" } }),
    prisma.blogPost.count({         where: { status: "PUBLISHED" } }),
    prisma.galleryItem.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalPageViews,
      totalVisitors: uniqueSessions,
      cvDownloads,
      contactSubmits,
      newMessages,
      totalProjects,
      publishedPosts,
      galleryItems,
    },
  });
}
