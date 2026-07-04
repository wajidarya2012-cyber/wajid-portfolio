import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { getPagination } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const { skip, take, page, limit } = getPagination(searchParams);
  const search = searchParams.get("search") ?? "";

  const where = search
    ? { OR: [{ title_en: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      include: { category: true, images: { take: 1, where: { isThumbnail: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    success: true, data: projects,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

interface FeatureInput { id?: string; en: string; ps: string; fa: string; }
interface ImageInput   { url: string; publicId: string; isThumbnail: boolean; caption: string; }

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }

  // Extract nested relation payloads — these are NOT part of projectSchema
  // and must be written separately via nested Prisma create.
  const features: FeatureInput[] = Array.isArray(body.features) ? body.features : [];
  const images:   ImageInput[]   = Array.isArray(body.images)   ? body.images   : [];

  try {
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        features: {
          create: features
            .filter(f => f.en?.trim())
            .map((f, i) => ({ text_en: f.en, text_ps: f.ps || f.en, text_fa: f.fa || f.en, sortOrder: i })),
        },
        images: {
          create: images.map((img, i) => ({
            url: img.url, publicId: img.publicId,
            isThumbnail: img.isThumbnail, caption: img.caption || null,
            sortOrder: i,
          })),
        },
      },
      include: { category: true, images: true, features: true, links: true },
    });

    await logActivity(user!.id, "CREATE", "Project", `Created project: ${project.title_en}`, project.id, request);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ success: false, error: "A project with this slug already exists." }, { status: 409 });
    }
    console.error("Project create error:", e);
    return NextResponse.json({ success: false, error: "Failed to create project." }, { status: 500 });
  }
}
