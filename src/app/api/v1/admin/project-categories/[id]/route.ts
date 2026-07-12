import { NextRequest, NextResponse } from "next/server";
import { prisma }               from "@/lib/prisma";
import { projectCategorySchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

type P = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.projectCategory.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const body   = await request.json();
  const parsed = projectCategorySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.projectCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return NextResponse.json({ success: false, error: "A category with this slug already exists" }, { status: 409 });
  }

  const cat = await prisma.projectCategory.update({ where: { id: params.id }, data: parsed.data });
  await logActivity(user!.id, "UPDATE", "ProjectCategory", `Updated category: ${cat.name_en}`, cat.id, request);
  return NextResponse.json({ success: true, data: cat });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.projectCategory.findUnique({
    where: { id: params.id },
    include: { _count: { select: { projects: true } } },
  });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  if (existing._count.projects > 0) {
    return NextResponse.json(
      { success: false, error: `Cannot delete: ${existing._count.projects} project(s) still use this category. Reassign or delete them first.` },
      { status: 409 }
    );
  }

  await prisma.projectCategory.delete({ where: { id: params.id } });
  await logActivity(user!.id, "DELETE", "ProjectCategory", `Deleted category: ${existing.name_en}`, params.id, request);
  return NextResponse.json({ success: true });
}