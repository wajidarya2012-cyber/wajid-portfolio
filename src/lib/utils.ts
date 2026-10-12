import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ──────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// createSlug lives in @/lib/slug — see the note there on why it is not in this module.

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
  // Precedence matches getClientIp() in src/lib/rateLimit.ts - see the note there for
  // why x-real-ip wins and why the forwarded fallback takes the LAST entry.
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const chain = request.headers.get("x-forwarded-for")?.split(",").map(s => s.trim()).filter(Boolean);
  return chain?.length ? chain[chain.length - 1] : "unknown";
}

// ── Locale-aware date formatter ────────────────────────────────────────────
// Public pages previously hardcoded `toLocaleDateString("en-US")` at four call
// sites, so every date rendered in English on /ps and /fa.
//
// `calendar: "gregory"` is deliberate. Passing a bare "ps"/"fa" locale to Intl
// switches to the Persian (Jalali) calendar — "۲۰ شهریور ۱۴۰۵" rather than
// "۱۱ سپتامبر ۲۰۲۶" — which silently changes what the date *means* relative to the
// Gregorian value stored in Postgres. Pinning the calendar keeps the date itself
// stable while still localising month names and numerals. If Jalali output is ever
// wanted for ps/fa, remove the option here once rather than at each call site.
export function formatDate(
  date:    Date | string | number,
  locale:  string = "en",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { ...options, calendar: "gregory" }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en", { ...options, calendar: "gregory" }).format(d);
  }
}

// ── Cloudinary delivery size ───────────────────────────────────────────────
// Admin uploads are served at their original size (a 1346px logo for a 28px slot,
// 5184px Journey photos). This asks Cloudinary for a copy that fits inside
// `width`×`height`, in the best format the browser accepts (AVIF/WebP via f_auto).
// c_limit only ever shrinks — never upscales or crops — so CSS still does all the
// cropping and fitting it did before. For object-fit:cover, pass a box larger than
// the slot so the image's short side still covers it.
// Returned unchanged: non-Cloudinary URLs, non-image resources, PDFs (the CV is
// stored as an image-type PDF and must stay a PDF), URLs that already carry a
// transformation, and signed URLs (an s--…-- segment; adding a transformation in
// front of it would invalidate the signature).
const CLOUDINARY_IMAGE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const CLOUDINARY_TRANSFORM_SEGMENT = /^[a-z]{1,4}_[^/]*$/;

export function cloudinaryImage(
  url:  string | null | undefined,
  size: { width?: number; height?: number }
): string {
  if (!url) return "";
  const m = url.match(CLOUDINARY_IMAGE);
  if (!m) return url;
  const [, base, rest] = m;
  if (/\.pdf$/i.test(rest.split(/[?#]/)[0])) return url;
  const first = rest.split("/")[0];
  if (first.startsWith("s--") || CLOUDINARY_TRANSFORM_SEGMENT.test(first)) return url;
  const params = ["c_limit", "f_auto", "q_auto"];
  if (size.width)  params.push(`w_${Math.round(size.width)}`);
  if (size.height) params.push(`h_${Math.round(size.height)}`);
  return `${base}${params.join(",")}/${rest}`;
}

// srcSet of cloudinaryImage() widths, or undefined when the URL can't be resized
// (so the browser just uses `src`, exactly as before).
export function cloudinarySrcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url || !widths.length || cloudinaryImage(url, { width: widths[0] }) === url) return undefined;
  return widths.map(w => `${cloudinaryImage(url, { width: w })} ${w}w`).join(", ");
}

// Density srcSet ("… 1x, … 2x") of square cloudinaryImage() boxes, for fixed object-fit:cover
// slots: width descriptors under-serve non-square photos there, because the short side is what has
// to cover the slot. Undefined when the URL can't be resized.
export function cloudinaryDensitySrcSet(url: string | null | undefined, boxes: number[]): string | undefined {
  if (!url || !boxes.length || cloudinaryImage(url, { width: boxes[0] }) === url) return undefined;
  return boxes.map((b, i) => `${cloudinaryImage(url, { width: b, height: b })} ${i + 1}x`).join(", ");
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
