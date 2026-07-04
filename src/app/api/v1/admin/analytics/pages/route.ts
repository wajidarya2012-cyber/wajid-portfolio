import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// This route only ever receives requests at /api/v1/admin/analytics/pages.
// The dead /countries and /projects branches that previously lived here
// (unreachable — file-based routing means this handler never sees those
// paths) have been removed. Top countries and top projects are computed
// directly in src/app/admin/(protected)/analytics/page.tsx via Prisma.
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const days  = parseInt(new URL(request.url).searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.$queryRaw<{ page: string; views: bigint }[]>`
    SELECT page, COUNT(*) AS views
    FROM visitor_analytics
    WHERE created_at >= ${since} AND event = 'PAGE_VIEW'
    GROUP BY page
    ORDER BY views DESC
    LIMIT 10
  `;

  return NextResponse.json({
    success: true,
    data: rows.map((r) => ({ page: r.page, views: Number(r.views) })),
  });
}
