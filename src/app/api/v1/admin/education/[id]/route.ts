import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

type P = { params:{id:string} };

export async function PUT(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  
  const body = await request.json();
  if (body.startYear !== undefined) body.startYear = Number(body.startYear);
  if (body.endYear !== undefined && body.endYear !== null && body.endYear !== "") {
    body.endYear = Number(body.endYear);
  } else if (body.endYear === "") {
    body.endYear = null;
  }
  const parsed = educationSchema.safeParse(body);
  
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed", issues:parsed.error.flatten() }, { status:422 });

  const existing = await prisma.education.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  const item = await prisma.education.update({ where:{id:params.id}, data:parsed.data });
  await logActivity(user!.id, "UPDATE", "Education", `Updated: ${item.degree_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item });
}

export async function DELETE(request: NextRequest, { params }: P) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.education.findUnique({ where:{id:params.id} });
  if (!existing) return NextResponse.json({ success:false, error:"Not found" }, { status:404 });

  await prisma.education.delete({ where:{id:params.id} });
  await logActivity(user!.id, "DELETE", "Education", `Deleted: ${existing.degree_en}`, params.id, request);
  return NextResponse.json({ success:true });
}