import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Public, unauthenticated view-count increment. It has to stay unauthenticated —
// it records anonymous gallery views — but before Phase 35 it had no rate limit,
// no input validation and no existence check, so an anonymous client could loop
// `POST /api/v1/gallery/<any-id>/view` and drive unbounded UPDATE statements
// against Neon (inflated metrics plus real database cost/contention).
//
// Same in-memory limiter the contact and analytics routes already use — no new
// mechanism, and consistent with the accepted single-instance tradeoff documented
// in CLAUDE.md §10.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`gallery-view:${ip}`, 60, 60 * 1000); // 60/min per IP
  if (!ok) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  // Reject malformed ids before they ever reach the database.
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  try {
    // updateMany (not update) so a non-existent id is a no-op rather than a thrown
    // P2025 — and scoped to visible items so hidden gallery rows cannot be probed
    // or have their counters moved.
    await prisma.galleryItem.updateMany({
      where: { id: params.id, visible: true },
      data:  { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch {
    // Non-critical — never break the gallery UI over a view-count failure.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
