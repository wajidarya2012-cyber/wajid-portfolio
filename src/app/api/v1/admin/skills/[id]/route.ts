import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { skillSchema } from "@/lib/validations";

type P = { params: { id: string } };

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.skill.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.skill.delete({ where: { id: params.id } });
  await logActivity(user!.id, "DELETE", "Skill", `Deleted skill: ${existing.name_en}`, params.id, request);
  return NextResponse.json({ success:true });
}

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const parsed = skillSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  }

  const existing = await prisma.skill.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const skill = await prisma.skill.update({ where: { id: params.id }, data: parsed.data });
  await logActivity(user!.id, "UPDATE", "Skill", `Updated skill: ${skill.name_en}`, skill.id, request);
  return NextResponse.json({ success:true, data:skill });
}
