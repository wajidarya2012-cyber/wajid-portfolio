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
// returns the value for that locale, falling back to "en".
export function t<T extends Record<string, unknown>>(
  obj:    T,
  field:  string,
  locale: string = "en"
): string {
  const key      = `${field}_${locale}` as keyof T;
  const fallback = `${field}_en`        as keyof T;
  return (obj[key] ?? obj[fallback] ?? "") as string;
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
