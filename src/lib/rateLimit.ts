// Lightweight in-memory rate limiter.
// Suitable for a single-admin personal portfolio; resets on cold start,
// which is an acceptable tradeoff for basic abuse protection without
// adding an external dependency (e.g. Redis/Upstash).

interface Bucket { count: number; resetAt: number; }
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

// Phase 35: prefer x-real-ip. `x-forwarded-for` is a comma-separated chain whose
// FIRST entry is the end closest to the client, so if any deployment appends rather
// than replaces it, a client can pin that entry to an arbitrary value and rotate it
// to defeat per-IP rate limiting (login brute-force being the one that matters).
// x-real-ip is set by the proxy itself and is a single value. On Vercel x-forwarded-for
// is largely trustworthy, so this is defence-in-depth rather than a confirmed live
// bypass - but it also makes local/self-hosted deployments correct, and taking the
// LAST forwarded entry is the right fallback because that is the hop nearest us.
export function getClientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const chain = request.headers.get("x-forwarded-for")?.split(",").map(s => s.trim()).filter(Boolean);
  return chain?.length ? chain[chain.length - 1] : "unknown";
}