import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const featured     = searchParams.get("featured") === "true";

    const projects = await prisma.project.findMany({
      where: {
        status: "ACTIVE",
        ...(featured     ? { featured: true }                               : {}),
        ...(categorySlug ? { category: { slug: categorySlug } }            : {}),
      },
      include: {
        category: true,
        images:   { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" } },
        links:    true,
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ success: true, data: projects });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
