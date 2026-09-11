import { redirect } from "next/navigation";

// `/admin` had a layout but no page, so it fell through to the root `[locale]` dynamic
// segment and rendered the full public homepage with HTTP 200.
//
// This is deliberately a page rather than a middleware rule: the root `middleware.ts` in
// this project is never compiled (Next.js looks for `src/middleware.ts` when a `src`
// directory is used), so a redirect added there would silently do nothing. See the note
// at the top of middleware.ts.
//
// Redirecting to the login screen rather than 404ing keeps `/admin` a usable entry point —
// `(protected)/layout.tsx` still performs the real auth check, and an already-signed-in
// admin is sent on to the dashboard from there.
export default function AdminIndexPage() {
  redirect("/admin/login");
}
