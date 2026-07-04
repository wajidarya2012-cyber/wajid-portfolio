import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: "PUBLISHED" },
    });
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }
    prisma.blogPost.update({
      where: { id: post.id },
      data:  { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
