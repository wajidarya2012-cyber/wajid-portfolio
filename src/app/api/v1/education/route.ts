import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Adjust this import path to where your Zod schema is actually located
import { educationSchema } from "@/lib/validations"; 

export async function GET() {
  try {
    const items = await prisma.education.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Coerce year fields to numbers since HTML inputs always return strings
    if (body.startYear !== undefined) body.startYear = Number(body.startYear);
    if (body.endYear !== undefined && body.endYear !== null && body.endYear !== "") {
      body.endYear = Number(body.endYear);
    } else if (body.endYear === "") {
      body.endYear = null;
    }
    
    const parsed = educationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() }, 
        { status: 422 }
      );
    }

    const item = await prisma.education.create({ data: parsed.data });
    
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/education error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}