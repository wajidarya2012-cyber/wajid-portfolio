import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const items = await prisma.experience.findMany({ orderBy: { sortOrder:"asc" } });
  return NextResponse.json({ success:true, data:items });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const body   = await request.json();
  const parsed = experienceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });
  const item = await prisma.experience.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "Experience", `Added: ${item.role_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item }, { status:201 });
}
