import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

type P = { params: { id:string } };

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const parsed = experienceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });

  const existing = await prisma.experience.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const item = await prisma.experience.update({ where:{id:params.id}, data:parsed.data });
  await logActivity(user!.id, "UPDATE", "Experience", `Updated: ${item.role_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.experience.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.experience.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "Experience", `Deleted: ${existing.role_en}`, params.id, request);
  return NextResponse.json({ success:true });
}
