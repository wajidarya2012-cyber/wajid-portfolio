import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  return NextResponse.json({ success:true, data: await prisma.certification.findMany({ orderBy:{sortOrder:"asc"} }) });
}
export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;
  const parsed = certificationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success:false, error:"Validation failed" }, { status:422 });
  const item = await prisma.certification.create({ data: parsed.data });
  await logActivity(user!.id, "CREATE", "Certification", `Added: ${item.name_en}`, item.id, request);
  return NextResponse.json({ success:true, data:item }, { status:201 });
}
