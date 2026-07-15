import { prisma }       from "@/lib/prisma";
import AnalyticsCharts  from "./AnalyticsCharts";

async function getAnalytics() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [visitorRows, pageRows, countryRows, topProjects] = await Promise.all([
    prisma.$queryRaw<{ date: string; views: bigint; unique: bigint }[]>`
      SELECT DATE("createdAt")::text AS date, COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS unique
      FROM visitor_analytics WHERE "createdAt" >= ${since30} AND event = 'PAGE_VIEW'
      GROUP BY DATE("createdAt") ORDER BY date ASC`,

    prisma.$queryRaw<{ page: string; views: bigint }[]>`
      SELECT page, COUNT(*) AS views FROM visitor_analytics
      WHERE "createdAt" >= ${since30} AND event = 'PAGE_VIEW'
      GROUP BY page ORDER BY views DESC LIMIT 10`,

    prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT COALESCE(country,'Unknown') AS country, COUNT(*) AS count
      FROM visitor_analytics WHERE "createdAt" >= ${since30}
      GROUP BY country ORDER BY count DESC LIMIT 12`,

    prisma.project.findMany({
      where:   { status: "ACTIVE" },
      select:  { id: true, title_en: true, slug: true, viewCount: true },
      orderBy: { viewCount: "desc" },
      take:    8,
    }),
  ]);

  return {
    visitorTrend: visitorRows.map(r => ({ date: r.date, views: Number(r.views), unique: Number(r.unique) })),
    topPages:     pageRows.map(r    => ({ page: r.page, views: Number(r.views) })),
    countries:    countryRows.map(r => ({ country: r.country, count: Number(r.count) })),
    topProjects,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <AnalyticsCharts data={data} />
    </div>
  );
}
