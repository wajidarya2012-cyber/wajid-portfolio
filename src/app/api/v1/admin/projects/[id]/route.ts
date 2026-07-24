import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireAdmin, logActivity } from "@/lib/adminGuard";
import { Prisma } from "@prisma/client";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const project = await prisma.project.findUnique({
    where:   { id: params.id },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, features: { orderBy: { sortOrder: "asc" } }, links: true },
  });
  if (!project) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: project });
}

interface FeatureInput { id?: string; en: string; ps: string; fa: string; }
interface ImageInput   { url: string; publicId: string; isThumbnail: boolean; caption: string; }
interface LinkInput    { id?: string; label_en: string; label_ps: string; label_fa: string; url: string; type: string; }

export async function PUT(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body   = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const features: FeatureInput[] = Array.isArray(body.features) ? body.features : [];
  const images:   ImageInput[]   = Array.isArray(body.images)   ? body.images   : [];
  const links:    LinkInput[]    = Array.isArray(body.links)    ? body.links    : [];

  try {
    // Replace features, images & links via nested deleteMany+create in a single
    // update mutation — avoids an interactive $transaction, which is
    // unreliable over pooled (pgbouncer) connections like Neon.
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        features: {
          deleteMany: {},
          create: features
            .filter(f => f?.en?.trim())
            .map((f, i) => ({ text_en: f.en, text_ps: f.ps || f.en, text_fa: f.fa || f.en, sortOrder: i })),
        },
        images: {
          deleteMany: {},
          create: images.map((img, i) => ({
            url: img.url, publicId: img.publicId,
            isThumbnail: img.isThumbnail, caption: img.caption || null,
            sortOrder: i,
          })),
        },
        links: {
          deleteMany: {},
          create: links
            .filter(l => l?.url?.trim())
            .map(l => ({ label_en: l.label_en || l.type, label_ps: l.label_ps || l.label_en || l.type, label_fa: l.label_fa || l.label_en || l.type, url: l.url, type: l.type || "demo" })),
        },
      },
      include: { category: true, images: true, features: true, links: true },
    });

    await logActivity(user!.id, "UPDATE", "Project", `Updated project: ${project.title_en}`, project.id, request);
    return NextResponse.json({ success: true, data: project });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ success: false, error: "A project with this slug already exists." }, { status: 409 });
    }
    console.error("Project update error:", e);
    return NextResponse.json({ success: false, error: "Failed to update project." }, { status: 500 });
  }
}

const QUICK_PATCH_FIELDS = ["sortOrder", "visible", "showOnHomepage", "featured", "status"] as const;

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const key of QUICK_PATCH_FIELDS) {
    if (key in body) data[key] = body[key];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const project = await prisma.project.update({ where: { id: params.id }, data });
  await logActivity(user!.id, "UPDATE", "Project", `Updated project: ${project.title_en}`, project.id, request);
  return NextResponse.json({ success: true, data: project });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id: params.id } });
  await logActivity(user!.id, "DELETE", "Project", `Deleted project: ${project.title_en}`, params.id, request);
  return NextResponse.json({ success: true });
}
