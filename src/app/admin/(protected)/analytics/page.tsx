import { prisma }        from "@/lib/prisma";
import AnalyticsCharts   from "./AnalyticsCharts";
import AnalyticsDateFilter from "./AnalyticsDateFilter";

type SearchParams = { from?: string; to?: string };

function parseRange(searchParams: SearchParams) {
  const from = searchParams.from ? new Date(`${searchParams.from}T00:00:00.000`) : null;
  const to   = searchParams.to   ? new Date(`${searchParams.to}T23:59:59.999`)   : null;
  const createdAt =
    from && to ? { gte: from, lte: to } :
    from       ? { gte: from }          :
    to         ? { lte: to }            :
    undefined; // no filter => all-time data (default)
  return { from, to, createdAt };
}

async function getAnalytics(searchParams: SearchParams) {
  const { from, to, createdAt } = parseRange(searchParams);
  const dateWhere = createdAt ? { createdAt } : {};

  // groupBy cannot run inside $transaction([...]) array form — run separately.
  const sessionsResult = await prisma.visitorAnalytics.groupBy({
    by:    ["sessionId"],
    where: { ...dateWhere },
  });
  const totalVisitors = sessionsResult.length;

  const [
    totalPageViews,
    cvDownloads,
    contactSubmits,
    visitorRows,
    pageRows,
    countryRows,
    projectViewRows,
  ] = await Promise.all([
    prisma.visitorAnalytics.count({ where: { event: "PAGE_VIEW",       ...dateWhere } }),
    prisma.visitorAnalytics.count({ where: { event: "CV_DOWNLOAD",    ...dateWhere } }),
    prisma.visitorAnalytics.count({ where: { event: "CONTACT_SUBMIT", ...dateWhere } }),

    from || to
      ? prisma.$queryRaw<{ date: string; views: bigint; unique: bigint }[]>`
          SELECT DATE("createdAt")::text AS date, COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS unique
          FROM visitor_analytics
          WHERE event = 'PAGE_VIEW'
            AND "createdAt" >= ${from ?? new Date(0)}
            AND "createdAt" <= ${to ?? new Date()}
          GROUP BY DATE("createdAt") ORDER BY date ASC`
      : prisma.$queryRaw<{ date: string; views: bigint; unique: bigint }[]>`
          SELECT DATE("createdAt")::text AS date, COUNT(*) AS views, COUNT(DISTINCT "sessionId") AS unique
          FROM visitor_analytics WHERE event = 'PAGE_VIEW'
          GROUP BY DATE("createdAt") ORDER BY date ASC`,

    from || to
      ? prisma.$queryRaw<{ page: string; views: bigint }[]>`
          SELECT page, COUNT(*) AS views FROM visitor_analytics
          WHERE event = 'PAGE_VIEW' AND "createdAt" >= ${from ?? new Date(0)} AND "createdAt" <= ${to ?? new Date()}
          GROUP BY page ORDER BY views DESC LIMIT 10`
      : prisma.$queryRaw<{ page: string; views: bigint }[]>`
          SELECT page, COUNT(*) AS views FROM visitor_analytics
          WHERE event = 'PAGE_VIEW'
          GROUP BY page ORDER BY views DESC LIMIT 10`,

    from || to
      ? prisma.$queryRaw<{ country: string; count: bigint }[]>`
          SELECT COALESCE(country,'Unknown') AS country, COUNT(*) AS count
          FROM visitor_analytics WHERE "createdAt" >= ${from ?? new Date(0)} AND "createdAt" <= ${to ?? new Date()}
          GROUP BY country ORDER BY count DESC LIMIT 12`
      : prisma.$queryRaw<{ country: string; count: bigint }[]>`
          SELECT COALESCE(country,'Unknown') AS country, COUNT(*) AS count
          FROM visitor_analytics
          GROUP BY country ORDER BY count DESC LIMIT 12`,

    from || to
      ? prisma.$queryRaw<{ projectId: string; views: bigint }[]>`
          SELECT "projectId", COUNT(*) AS views FROM visitor_analytics
          WHERE event = 'PROJECT_VIEW' AND "projectId" IS NOT NULL
            AND "createdAt" >= ${from ?? new Date(0)} AND "createdAt" <= ${to ?? new Date()}
          GROUP BY "projectId" ORDER BY views DESC LIMIT 8`
      : prisma.$queryRaw<{ projectId: string; views: bigint }[]>`
          SELECT "projectId", COUNT(*) AS views FROM visitor_analytics
          WHERE event = 'PROJECT_VIEW' AND "projectId" IS NOT NULL
          GROUP BY "projectId" ORDER BY views DESC LIMIT 8`,
  ]);

  const projectIds = projectViewRows.map(r => r.projectId);
  const projectDetails = projectIds.length
    ? await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, title_en: true, slug: true } })
    : [];
  const projectMap = Object.fromEntries(projectDetails.map(p => [p.id, p]));
  const topProjects = projectViewRows
    .map(r => ({
      id:        r.projectId,
      title_en:  projectMap[r.projectId]?.title_en ?? "Unknown project",
      slug:      projectMap[r.projectId]?.slug ?? "",
      viewCount: Number(r.views),
    }))
    .filter(p => projectMap[p.id]);

  return {
    summary: { totalPageViews, totalVisitors, cvDownloads, contactSubmits },
    visitorTrend: visitorRows.map(r => ({ date: r.date, views: Number(r.views), unique: Number(r.unique) })),
    topPages:     pageRows.map(r    => ({ page: r.page, views: Number(r.views) })),
    countries:    countryRows.map(r => ({ country: r.country, count: Number(r.count) })),
    topProjects,
  };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await getAnalytics(searchParams);
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <AnalyticsDateFilter from={searchParams.from ?? ""} to={searchParams.to ?? ""} />
      </div>
      <AnalyticsCharts data={data} from={searchParams.from} to={searchParams.to} />
    </div>
  );
}
