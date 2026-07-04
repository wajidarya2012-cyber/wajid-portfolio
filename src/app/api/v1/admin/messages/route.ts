import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { getPagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const { skip, take, page, limit } = getPagination(searchParams);
  const status = searchParams.get("status");

  const where = status ? { status: status as "NEW" | "READ" | "REPLIED" | "ARCHIVED" } : {};

  const [messages, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return NextResponse.json({
    success: true, data: messages,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
