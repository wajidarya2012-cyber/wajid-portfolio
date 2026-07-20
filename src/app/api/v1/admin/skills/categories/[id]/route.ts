import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { skillCategorySchema } from "@/lib/validations";

type P = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const parsed = skillCategorySchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  }

  const existing = await prisma.skillCategory.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const cat = await prisma.skillCategory.update({ where: { id: params.id }, data: parsed.data });
  await logActivity(user!.id, "UPDATE", "SkillCategory", `Updated category: ${cat.name_en}`, cat.id, request);
  return NextResponse.json({ success:true, data:cat });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.skillCategory.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  // Skills cascade-delete via the schema's onDelete: Cascade relation.
  await prisma.skillCategory.delete({ where: { id: params.id } });
  await logActivity(user!.id, "DELETE", "SkillCategory", `Deleted category: ${existing.name_en}`, params.id, request);
  return NextResponse.json({ success:true });
}
