import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/localeUrls";

// Native Next.js robots route. Before this existed, /robots.txt matched the root
// `[locale]` dynamic segment and served the full English homepage as text/html with a
// 200 — a crawler asking for robots directives got a 243KB HTML document.
//
// Origin comes from siteOrigin() (NEXT_PUBLIC_APP_URL) so this is correct in local,
// Preview and Production without any environment-specific branching, and no production
// domain is hardcoded.
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces. /admin/* is already auth-gated server-side — this only keeps
        // it out of the index. /api/* returns JSON and has no crawl value.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
