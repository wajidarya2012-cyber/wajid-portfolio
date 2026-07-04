import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

type P = { params:{id:string} };

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.galleryItem.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.galleryItem.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "GalleryItem", `Deleted gallery item (${existing.category})`, params.id, request);
  return NextResponse.json({ success:true });
}
