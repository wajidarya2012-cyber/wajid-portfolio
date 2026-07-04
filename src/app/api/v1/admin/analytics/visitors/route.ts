import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// GET /api/v1/admin/analytics/visitors — daily trend
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const days  = parseInt(new URL(request.url).searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Raw daily counts — group by date using Prisma raw query
  const rows = await prisma.$queryRaw<{ date: string; views: bigint; unique: bigint }[]>`
    SELECT
      DATE(created_at)::text AS date,
      COUNT(*)               AS views,
      COUNT(DISTINCT session_id) AS unique
    FROM visitor_analytics
    WHERE created_at >= ${since}
      AND event = 'PAGE_VIEW'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const trend = rows.map((r) => ({
    date:   r.date,
    views:  Number(r.views),
    unique: Number(r.unique),
  }));

  return NextResponse.json({ success: true, data: trend });
}
