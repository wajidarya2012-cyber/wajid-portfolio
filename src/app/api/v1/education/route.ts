import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, read-only endpoint — GET only, matching every other public route file
// (certifications, experience, skills, journey, profile, projects, blog, gallery).
// All Education writes go through the authenticated admin routes, which enforce
// requireAdmin() and record an ActivityLog entry:
//   POST        /api/v1/admin/education
//   PUT/DELETE  /api/v1/admin/education/[id]
export async function GET() {
  try {
    const items = await prisma.education.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
