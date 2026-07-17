import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { getIp } from "@/lib/utils";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { ok, retryAfterMs } = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000); // 5 per 10 min
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const body   = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const message = await prisma.contactMessage.create({
      data: {
        ...parsed.data,
        ipAddress: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    });

    // Track contact submit event
    const sessionId = request.headers.get("x-session-id");
    if (sessionId) {
      await prisma.visitorAnalytics.create({
        data: {
          sessionId,
          page:  "/contact",
          event: "CONTACT_SUBMIT",
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: { id: message.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
