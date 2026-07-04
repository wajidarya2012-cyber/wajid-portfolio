import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { z } from "zod";

type Params = { params: { id: string } };

const patchSchema = z.object({
  status:    z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]).optional(),
  adminNote: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const msg = await prisma.contactMessage.findUnique({ where: { id: params.id } });
  if (!msg) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Auto-mark as read when opened
  if (msg.status === "NEW") {
    await prisma.contactMessage.update({ where: { id: params.id }, data: { status: "READ" } });
  }

  return NextResponse.json({ success: true, data: msg });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });
  }

  const existing = await prisma.contactMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const msg = await prisma.contactMessage.update({ where: { id: params.id }, data: parsed.data });
  await logActivity(user!.id, "UPDATE", "ContactMessage", `Updated message status to ${msg.status}`, params.id, request);
  return NextResponse.json({ success: true, data: msg });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const existing = await prisma.contactMessage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await prisma.contactMessage.delete({ where: { id: params.id } });
  await logActivity(user!.id, "DELETE", "ContactMessage", `Deleted message from: ${existing.name}`, params.id, request);
  return NextResponse.json({ success: true });
}
