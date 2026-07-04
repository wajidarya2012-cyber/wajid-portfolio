import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { getPagination } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const { skip, take, page, limit } = getPagination(searchParams);
  const [posts, total] = await prisma.$transaction([
    prisma.blogPost.findMany({ orderBy:{ createdAt:"desc" }, skip, take }),
    prisma.blogPost.count(),
  ]);
  return NextResponse.json({ success:true, data:posts, meta:{ total, page, limit, pages:Math.ceil(total/limit) } });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const parsed = blogPostSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  try {
    const post = await prisma.blogPost.create({ data: { ...parsed.data, publishedAt: parsed.data.status==="PUBLISHED"?new Date():null } });
    await logActivity(user!.id, "CREATE", "BlogPost", `Created: ${post.title_en}`, post.id, request);
    return NextResponse.json({ success:true, data:post }, { status:201 });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ success:false, error:"A post with this slug already exists." }, { status:409 });
    }
    console.error("Blog create error:", e);
    return NextResponse.json({ success:false, error:"Failed to create post." }, { status:500 });
  }
}
