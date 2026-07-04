import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const items = await prisma.galleryItem.findMany({ orderBy:{ sortOrder:"asc" } });
  return NextResponse.json({ success:true, data:items });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const body = await request.json();

  if (typeof body.url !== "string" || typeof body.publicId !== "string") {
    return NextResponse.json({ success:false, error:"url and publicId are required." }, { status:422 });
  }

  const item = await prisma.galleryItem.create({ data:{ url:body.url, publicId:body.publicId, caption_en:body.caption_en, caption_ps:body.caption_ps, caption_fa:body.caption_fa, category:body.category??"general", sortOrder:body.sortOrder??0 } });
  await logActivity(user!.id, "CREATE", "GalleryItem", `Uploaded image to ${item.category}`, item.id, request);
  return NextResponse.json({ success:true, data:item }, { status:201 });
}
