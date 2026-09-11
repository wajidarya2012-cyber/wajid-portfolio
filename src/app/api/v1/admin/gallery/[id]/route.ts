import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { revalidateGallery } from "@/lib/revalidate";

type P = { params:{id:string} };

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const parsed = galleryItemSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  }

  const existing = await prisma.galleryItem.findUnique({ where:{ id:params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const item = await prisma.galleryItem.update({ where:{ id:params.id }, data: parsed.data });
  await logActivity(user!.id, "UPDATE", "GalleryItem", `Updated gallery item (${item.category})`, item.id, request);
  revalidateGallery();
  return NextResponse.json({ success:true, data:item });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.galleryItem.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.galleryItem.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "GalleryItem", `Deleted gallery item (${existing.category})`, params.id, request);
  revalidateGallery();
  return NextResponse.json({ success:true });
}
