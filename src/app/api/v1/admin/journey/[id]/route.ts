import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { journeySlideSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

type P = { params:{id:string} };

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const parsed = journeySlideSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });

  const existing = await prisma.journeySlide.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const item = await prisma.journeySlide.update({ where:{id:params.id}, data:parsed.data });
  await logActivity(user!.id, "UPDATE", "JourneySlide", `Updated: ${item.title_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.journeySlide.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.journeySlide.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "JourneySlide", `Deleted: ${existing.title_en}`, params.id, request);
  return NextResponse.json({ success:true });
}
