import { NextRequest, NextResponse } from "next/server";
import { prisma }       from "@/lib/prisma";
import { skillSchema }  from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const cats = await prisma.skillCategory.findMany({
    include: { skills: { orderBy: { sortOrder:"asc" } } },
    orderBy: { sortOrder:"asc" },
  });
  return NextResponse.json({ success:true, data:cats });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const body   = await request.json();
  const parsed = skillSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  const skill = await prisma.skill.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "Skill", `Added skill: ${skill.name_en}`, skill.id, request);
  return NextResponse.json({ success:true, data:skill }, { status:201 });
}
