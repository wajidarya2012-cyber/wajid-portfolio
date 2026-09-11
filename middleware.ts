// ⚠ THIS FILE IS NOT ACTIVE. ────────────────────────────────────────────────────────
// Verified 2026-09-11 against a production build: `.next/server/middleware-manifest.json`
// contains `"middleware": {}` / `"sortedMiddleware": []`, no `middleware.js` is emitted,
// and `next build` never mentions middleware. Next.js looks for middleware **next to the
// app directory** — this project uses `src/app`, so the file would have to live at
// `src/middleware.ts`. At the repo root it is silently ignored.
//
// Nothing depends on it, which is why this went unnoticed for so long:
//   - `/` to `/en` is handled by `redirects()` in next.config.js, not here.
//   - Locale resolution is handled by `setRequestLocale()` in `[locale]/layout.tsx`
//     and explicit `getTranslations({ locale })` calls, not by next-intl middleware.
//   - `/api` and `/admin` need no pass-through because routes and layouts self-guard.
//
// DO NOT "fix" this by moving the file without re-testing locale routing end to end.
// Activating createMiddleware would start redirecting/rewriting every public request and
// interacts with both the invalid-locale `notFound()` guard in `[locale]/layout.tsx` and
// the Phase 30 static caching of /blog and /gallery. It is left inert on purpose;
// `/admin` is handled by `src/app/admin/page.tsx` instead.
// ─────────────────────────────────────────────────────────────────────────────────────
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales:       ["en", "ps", "fa"],
  defaultLocale: "en",
  localePrefix:  "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root path — force redirect to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  // API routes — skip everything
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Admin routes — handled entirely by Next.js layouts
  // (protected)/layout.tsx checks auth and redirects to /admin/login
  // /admin/login has no auth layout so it always renders freely
  if (pathname.startsWith("/admin")) {
    // /admin itself has no page (only a layout), so it used to fall through to the
    // root [locale] segment and render the public homepage with a 200. Send it to the
    // login screen — the (protected) layout handles the authenticated case from there.
    if (pathname === "/admin" || pathname === "/admin/") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Public routes — apply i18n locale middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|_vercel|favicon\\.svg|.*\\..*).*)",
  ],
};