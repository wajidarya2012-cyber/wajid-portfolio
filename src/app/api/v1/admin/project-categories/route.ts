import { NextRequest, NextResponse } from "next/server";
import { prisma }               from "@/lib/prisma";
import { projectCategorySchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = projectCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });

  const existing = await prisma.projectCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ success: false, error: "A category with this slug already exists" }, { status: 409 });

  const cat = await prisma.projectCategory.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "ProjectCategory", `Added category: ${cat.name_en}`, cat.id, request);
  return NextResponse.json({ success: true, data: cat }, { status: 201 });
}