import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where:   { slug: params.slug, status: "ACTIVE" },
      include: {
        category: true,
        images:   { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" } },
        links:    true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    prisma.project.update({
      where: { id: project.id },
      data:  { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
