import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  return NextResponse.json({ success:true, data: await prisma.education.findMany({ orderBy:{sortOrder:"asc"} }) });
}

export async function POST(request: NextRequest) {
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
  
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed" }, { status:422 });
  const item = await prisma.education.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "Education", `Added: ${item.degree_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item }, { status:201 });
}