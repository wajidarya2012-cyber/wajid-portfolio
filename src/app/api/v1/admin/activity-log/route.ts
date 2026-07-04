import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
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
