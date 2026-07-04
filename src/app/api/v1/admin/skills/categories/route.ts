import { NextRequest, NextResponse } from "next/server";
import { prisma }              from "@/lib/prisma";
import { skillCategorySchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const body   = await request.json();
  const parsed = skillCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed" }, { status:422 });
  const cat = await prisma.skillCategory.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "SkillCategory", `Added category: ${cat.name_en}`, cat.id, request);
  return NextResponse.json({ success:true, data:cat }, { status:201 });
}
