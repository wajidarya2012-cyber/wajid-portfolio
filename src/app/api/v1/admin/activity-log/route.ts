import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { getPagination } from "@/lib/utils";
import { LogAction } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const { skip, take, page, limit } = getPagination(searchParams);
  const entity = searchParams.get("entity");
  const actionParam = searchParams.get("action");
  const action = actionParam && actionParam in LogAction ? (actionParam as LogAction) : null;

  const where = {
    ...(entity ? { entity } : {}),
    ...(action ? { action } : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true, data: logs,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// DELETE /api/v1/admin/activity-log  — clear ALL activity log entries.
// Requires an explicit confirmation flag in the body so it can't be triggered accidentally.
export async function DELETE(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (body?.confirm !== "DELETE") {
    return NextResponse.json({ success: false, error: "Confirmation required." }, { status: 400 });
  }

  const { count } = await prisma.activityLog.deleteMany({});
  await logActivity(user!.id, "DELETE", "ActivityLog", `Cleared all activity logs (${count} entries)`, undefined, request);

  return NextResponse.json({ success: true, deletedCount: count });
}
