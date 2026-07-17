import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyticsTrackSchema } from "@/lib/validations";
import { getIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

// Lightweight IP→country lookup (geoip-lite, bundled DB — no external call)
async function getCountry(ip: string): Promise<string | null> {
  try {
    const geoip = await import("geoip-lite");
    const geo   = geoip.default.lookup(ip);
    return geo?.country ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    const { ok } = rateLimit(`analytics:${ip}`, 60, 60 * 1000); // 60 events/min per IP
    if (!ok) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const body   = await request.json();
    const parsed = analyticsTrackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: 422 });
    }
    const country = await getCountry(ip);

    await prisma.visitorAnalytics.create({
      data: {
        sessionId: parsed.data.sessionId,
        page:      parsed.data.page,
        event:     parsed.data.event,
        projectId: parsed.data.projectId ?? null,
        referrer:  parsed.data.referrer  ?? request.headers.get("referer") ?? null,
        userAgent: request.headers.get("user-agent") ?? null,
        country,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
