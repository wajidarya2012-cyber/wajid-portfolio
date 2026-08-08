import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

// ── Tailwind class merger ──────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Slug generator ─────────────────────────────────────────────────────────
export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

// ── Standard API response helpers ─────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

// ── Pagination helper ──────────────────────────────────────────────────────
export function getPagination(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

// ── Locale-aware field picker ──────────────────────────────────────────────
// Given an object like { title_en, title_ps, title_fa } and locale "ps",
// returns the value for that locale, falling back to "en" when missing OR
// when the localized value is an empty string (blank admin field).
export function t<T extends Record<string, unknown>>(
  obj:    T,
  field:  string,
  locale: string = "en"
): string {
  const key      = `${field}_${locale}` as keyof T;
  const fallback = `${field}_en`        as keyof T;
  const val      = obj[key] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[fallback] as string)) ?? "";
}

// ── Two-tone section title splitter ─────────────────────────────────────────
// Given a full translated title ("Skills & Technologies") and the substring
// that should render with the gradient accent ("Technologies"), returns the
// three parts to render around it — or null if the substring isn't found
// (caller should then render the full title plain, un-split).
export function splitTitle(
  full:      string,
  highlight: string
): { before: string; match: string; after: string } | null {
  if (!highlight) return null;
  const idx = full.indexOf(highlight);
  if (idx === -1) return null;
  return { before: full.slice(0, idx), match: highlight, after: full.slice(idx + highlight.length) };
}

// ── IP address extractor from Next.js request ──────────────────────────────
export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Date formatter ─────────────────────────────────────────────────────────
export function formatDate(date: Date | string, locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
    year: "numeric", month: "long",
  }).format(new Date(date));
}

// ── Truncate text ──────────────────────────────────────────────────────────
export function truncate(str: string, max = 160): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

// ── Range array (for pagination UI) ───────────────────────────────────────
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ── Estimated reading time (derived at render time — no stored/duplicate field) ──
export function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
