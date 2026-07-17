import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LogAction } from "@prisma/client";
import { getIp } from "@/lib/utils";

export async function requireAdmin(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return {
      user:  null,
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      user:  null,
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user: session.user, error: null };
}

export async function logActivity(
  userId:      string,
  action:      LogAction,
  entity:      string,
  description: string,
  entityId?:   string,
  request?:    Request
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId:    entityId ?? null,
      description,
      ipAddress:   request ? getIp(request) : null,
    },
  }).catch(() => {}); // never throw on log failure
}
