import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales:       ["en", "ps", "fa"],
  defaultLocale: "en",
  localePrefix:  "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes — skip everything
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Admin routes — handled entirely by Next.js layouts
  // (protected)/layout.tsx checks auth and redirects to /admin/login
  // /admin/login has no auth layout so it always renders freely
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Public routes — apply i18n locale middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon\\.svg|.*\\..*).*)",
  ],
};
