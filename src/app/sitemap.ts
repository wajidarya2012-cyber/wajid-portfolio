import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n";
import { localizedUrl, hreflangMap, type PublicRoute } from "@/lib/localeUrls";

// Native Next.js sitemap. Like robots.ts, this previously did not exist and
// /sitemap.xml matched the root `[locale]` segment, serving the English homepage as
// text/html.
//
// URL generation reuses src/lib/localeUrls.ts — the Phase 32 route-to-locale helper —
// so sitemap entries, canonical tags and hreflang sets cannot drift apart. No second
// URL-building implementation is introduced here.
//
// Only public, indexable routes are listed. Admin, login and API are excluded (and also
// disallowed in robots.ts).

// Every entry carries its own hreflang alternates, which is what tells Google the three
// locales are translations of one another rather than duplicates.
function entry(route: PublicRoute, lastModified: Date, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return locales.map(locale => ({
    url: localizedUrl(route, locale),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: hreflangMap(route) },
  }));
}

// Rendered per request rather than baked at build. Observed in Phase 36: a build that ran
// while Neon was cold produced a sitemap containing only the 9 static routes — every blog post
// and project silently missing, and frozen that way until the next deploy. A sitemap is fetched
// rarely (by crawlers), so one query per request is a negligible cost for never being able to
// serve a content-less sitemap. This does NOT affect Phase 30: /blog and /gallery are separate
// routes and remain statically cached.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public routes always ship, even if the database is unreachable at build time.
  // Every query below is .catch()-wrapped for the same reason: a cold Neon instance
  // during a build must degrade to a smaller sitemap, never fail the deploy.
  const staticEntries: MetadataRoute.Sitemap = [
    ...entry({ type: "home" }, now, 1.0, "weekly"),
    ...entry({ type: "blog" }, now, 0.8, "weekly"),
    ...entry({ type: "gallery" }, now, 0.6, "monthly"),
  ];

  const [posts, projects] = await Promise.all([
    prisma.blogPost
      .findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })
      .catch(() => []),
    prisma.project
      .findMany({ where: { status: "ACTIVE", visible: true }, select: { slug: true, updatedAt: true } })
      .catch(() => []),
  ]);

  const postEntries = posts.flatMap(p =>
    entry({ type: "blogPost", slug: p.slug }, p.updatedAt ?? now, 0.7, "monthly"),
  );
  const projectEntries = projects.flatMap(p =>
    entry({ type: "project", slug: p.slug }, p.updatedAt ?? now, 0.7, "monthly"),
  );

  return [...staticEntries, ...postEntries, ...projectEntries];
}
