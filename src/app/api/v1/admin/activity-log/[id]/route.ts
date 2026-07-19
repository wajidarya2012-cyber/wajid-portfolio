import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.activityLog.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await prisma.activityLog.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
