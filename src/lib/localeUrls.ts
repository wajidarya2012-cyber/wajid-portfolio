import { locales, defaultLocale, type Locale } from "@/i18n";

// ── Route-to-locale URL mapping — the single source of truth ────────────────
//
// THIS FILE is where a logical public route becomes a set of localized URLs:
//
//     logical route            ->  /en/...   /ps/...   /fa/...   + x-default
//
// Nothing else in the codebase may build a localized public URL by hand. Before
// Phase 32 there was no such place at all: no page emitted a canonical URL or an
// hreflang set, and the two detail pages each re-derived a share URL from
// NEXT_PUBLIC_APP_URL inline. Adding hreflang page-by-page would have meant five
// copies of "/en|/ps|/fa" string-joining, which is exactly how locale sets drift.
//
// Locales are NOT redefined here — `locales` and `defaultLocale` are imported from
// src/i18n.ts, the canonical next-intl config. Adding a locale there propagates to
// every canonical tag, hreflang set and og:locale:alternate automatically.
//
// Deliberately contains no dynamic API (no headers()/cookies()) and does no I/O: it
// is pure string building over `params.locale`, so calling it from generateMetadata()
// cannot opt a route out of static rendering. That matters — Phase 30 keeps
// /[locale]/blog and /[locale]/gallery statically cached.

/** A logical public route, independent of locale. Add a case here when a new public route family appears. */
export type PublicRoute =
  | { type: "home" }
  | { type: "blog" }
  | { type: "gallery" }
  | { type: "blogPost"; slug: string }
  | { type: "project"; slug: string };

/**
 * Locale-independent path segment(s) for a route, without the locale prefix.
 *
 * Blog posts and projects use ONE slug shared across all locales: `slug` is a single
 * `String @unique` column on both models (there are no `slug_en`/`slug_ps`/`slug_fa`
 * fields), and the detail-page queries filter only on `slug` + status — never on
 * locale. So /en/blog/x, /ps/blog/x and /fa/blog/x all resolve to the same row, with
 * per-locale fields chosen at render time by `t()` from src/lib/utils.ts. That is what
 * makes hreflang for detail routes valid rather than invented. Do not introduce
 * locale-specific slugs without revisiting this file and the canonical/hreflang output.
 */
function routeSuffix(route: PublicRoute): string {
  switch (route.type) {
    case "home":     return "";
    case "blog":     return "/blog";
    case "gallery":  return "/gallery";
    case "blogPost": return `/blog/${route.slug}`;
    case "project":  return `/projects/${route.slug}`;
  }
}

/**
 * Site origin, no trailing slash. Mirrors the `metadataBase` in src/app/layout.tsx so
 * canonical/hreflang URLs match Open Graph URLs exactly.
 *
 * Reads NEXT_PUBLIC_APP_URL and falls back to localhost, so the same code is correct in
 * local dev, Vercel Preview and Production with no environment-specific branching — set
 * the variable per environment. No production domain is hardcoded here.
 */
export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Root-relative localized path, e.g. localizedPath({type:"blog"}, "ps") -> "/ps/blog". */
export function localizedPath(route: PublicRoute, locale: string): string {
  const safe = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  return `/${safe}${routeSuffix(route)}`;
}

/** Absolute localized URL. Used for og:url and for share links. */
export function localizedUrl(route: PublicRoute, locale: string): string {
  return `${siteOrigin()}${localizedPath(route, locale)}`;
}

/**
 * hreflang map for a route: every supported locale plus `x-default`.
 *
 * `x-default` points at the default locale's URL (English). Reasoning: the site has no
 * language-selector landing page — `middleware.ts` redirects `/` straight to `/en`, and
 * `localePrefix: "always"` means there is no un-prefixed URL to nominate. English is
 * therefore the de-facto destination for a visitor whose language matches none of the
 * three, which is precisely what x-default is for.
 */
export function hreflangMap(route: PublicRoute): Record<string, string> {
  const map: Record<string, string> = {};
  for (const loc of locales) map[loc] = localizedUrl(route, loc);
  map["x-default"] = localizedUrl(route, defaultLocale);
  return map;
}

/** Open Graph locale tag. OG wants `language_TERRITORY`, not a bare language code. */
export function ogLocale(locale: string): string {
  const OG: Record<Locale, string> = { en: "en_US", ps: "ps_AF", fa: "fa_AF" };
  return OG[(locale as Locale)] ?? OG[defaultLocale];
}

/** The other locales' OG tags, for og:locale:alternate. */
export function ogLocaleAlternates(locale: string): string[] {
  return locales.filter(l => l !== locale).map(ogLocale);
}

/**
 * The complete locale-aware SEO block for one route in one locale — canonical, hreflang
 * and the Open Graph locale/url fields, ready to spread into a Next.js `Metadata` object.
 *
 * This is the API metadata functions should call; it keeps route-to-locale mapping out of
 * the pages entirely:
 *
 *     const seo = localizedSeo({ type: "blogPost", slug }, locale);
 *     return { title, description, alternates: seo.alternates,
 *              openGraph: { ...seo.openGraph, title, description } };
 *
 * Canonical is each page's OWN localized URL — /ps/blog canonicalizes to /ps/blog, never
 * to /en/blog. Cross-canonicalising translations to English would tell Google the
 * Pashto and Dari pages are duplicates and should be dropped from the index; hreflang,
 * not canonical, is what expresses the translation relationship.
 */
export function localizedSeo(route: PublicRoute, locale: string) {
  return {
    alternates: {
      canonical: localizedUrl(route, locale),
      languages: hreflangMap(route),
    },
    openGraph: {
      url: localizedUrl(route, locale),
      locale: ogLocale(locale),
      alternateLocale: ogLocaleAlternates(locale),
    },
  };
}
