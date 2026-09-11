import { revalidatePath } from "next/cache";

// ── Public-route cache invalidation ─────────────────────────────────────────
//
// WHY THIS EXISTS
// `[locale]/layout.tsx` declares `generateStaticParams()` for en/ps/fa. Any page
// beneath it whose remaining route segments are therefore fully enumerable, which
// uses no dynamic API (`cookies()`/`headers()`/`searchParams`) and which declares
// no route-segment config, gets **fully prerendered at build time with
// `initialRevalidateSeconds: false`** — cached until the next deployment.
//
// That is exactly what froze `/[locale]/blog` and `/[locale]/gallery`: admin CMS
// edits never reached them. Calling Prisma and reading `params` does NOT opt a
// route out of static rendering — only a dynamic API, an uncached `fetch`, or an
// explicit `dynamic`/`revalidate` export does. See docs/ARCHITECTURE.md
// § Rendering strategy.
//
// STRATEGY
// On-demand invalidation rather than `force-dynamic`, so those two pages keep
// their static delivery (fast, cheap, good for SEO) while still reflecting admin
// edits immediately. Every admin mutation that changes public content calls the
// matching helper below after its database write.
//
// MULTILINGUAL
// Passing a route *pattern* plus "page"/"layout" revalidates every URL matching
// that route file, so a single call covers /en, /ps and /fa at once. Never
// hardcode a locale here — doing so would leave the other two stale.
//
// NO-OPS ARE INTENTIONAL
// Routes that already render dynamically (the homepage, `/blog/[slug]`,
// `/projects/[slug]`) are always fresh, so revalidating them does nothing today.
// They are still listed deliberately: adding `generateStaticParams()` to a
// `[slug]` route — the obvious next SEO step — would otherwise silently
// reintroduce the staleness this module exists to prevent.

// A revalidation failure must never fail the mutation that triggered it: the
// database write has already committed by the time these run. Same rule as
// `logActivity()` in src/lib/adminGuard.ts.
function safeRevalidate(path: string, type?: "page" | "layout"): void {
  try {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  } catch (err) {
    console.error(`revalidatePath failed for "${path}":`, err);
  }
}

/** Blog listing (statically cached — the real fix) + post detail, all locales. */
export function revalidateBlog(): void {
  safeRevalidate("/[locale]/blog", "page");
  safeRevalidate("/[locale]/blog/[slug]", "page"); // dynamic today; future-proofing
  safeRevalidate("/sitemap.xml"); // sitemap lists every published post
}

/** Gallery page (statically cached) + the public gallery API, all locales. */
export function revalidateGallery(): void {
  safeRevalidate("/[locale]/gallery", "page");
  safeRevalidate("/api/v1/gallery"); // GET Route Handler — also prerendered at build
}

/**
 * Project detail pages, all locales. The project *listing* lives on the homepage,
 * which is `force-dynamic` and therefore already always fresh.
 */
export function revalidateProjects(): void {
  safeRevalidate("/[locale]/projects/[slug]", "page"); // dynamic today; future-proofing
  safeRevalidate("/sitemap.xml"); // sitemap lists every visible active project
}

/**
 * Shared chrome that `[locale]/layout.tsx` renders into *every* page — navbar,
 * footer, brand, profile — plus the `gallery_albums` / `*_section_config` keys the
 * settings route writes. "layout" cascades to every nested page, which is what
 * refreshes the statically cached `/blog` and `/gallery` after a settings or
 * profile edit. Without this, renaming a nav item would leave those two pages
 * showing the old navbar until the next deploy.
 */
export function revalidateSiteChrome(): void {
  safeRevalidate("/[locale]", "layout");
  safeRevalidate("/api/v1/profile"); // GET Route Handler — also prerendered at build
}

/** Everything — for backup/restore, which replaces every content table at once. */
export function revalidateAll(): void {
  revalidateSiteChrome();
  revalidateBlog();
  revalidateGallery();
  revalidateProjects();
}
