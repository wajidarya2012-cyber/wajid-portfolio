import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPagination(searchParams);

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where:   { status: "PUBLISHED" },
        select: {
          id: true, slug: true,
          title_en: true, title_ps: true, title_fa: true,
          excerpt_en: true, excerpt_ps: true, excerpt_fa: true,
          coverImage: true, publishedAt: true, viewCount: true,
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take,
      }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
