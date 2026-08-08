import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.galleryItem.update({
      where: { id: params.id },
      data:  { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch {
    // Non-critical — never break the gallery UI over a view-count failure.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
