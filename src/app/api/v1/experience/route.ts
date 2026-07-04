import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.experience.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
