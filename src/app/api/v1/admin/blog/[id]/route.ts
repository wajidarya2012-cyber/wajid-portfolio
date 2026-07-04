import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { Prisma } from "@prisma/client";

type P = { params:{id:string} };

export async function GET(request: NextRequest, { params }: P) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const post = await prisma.blogPost.findUnique({ where:{id:params.id} });
  if (!post) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });
  return NextResponse.json({ success:true, data:post });
}

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const parsed = blogPostSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });

  const existing = await prisma.blogPost.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const publishedAt = parsed.data.status==="PUBLISHED" && existing.status!=="PUBLISHED" ? new Date() : existing.publishedAt;

  try {
    const post = await prisma.blogPost.update({ where:{id:params.id}, data:{ ...parsed.data, publishedAt } });
    await logActivity(user!.id, "UPDATE", "BlogPost", `Updated: ${post.title_en}`, post.id, request);
    return NextResponse.json({ success:true, data:post });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ success:false, error:"A post with this slug already exists." }, { status:409 });
    }
    console.error("Blog update error:", e);
    return NextResponse.json({ success:false, error:"Failed to update post." }, { status:500 });
  }
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const existing = await prisma.blogPost.findUnique({ where:{ id:params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });
  await prisma.blogPost.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "BlogPost", `Deleted post: ${existing.title_en}`, params.id, request);
  return NextResponse.json({ success:true });
}
