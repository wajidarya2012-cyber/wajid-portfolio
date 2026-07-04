import { notFound }  from "next/navigation";
import { prisma }    from "@/lib/prisma";
import ProjectForm   from "@/components/admin/ProjectForm";
import Link          from "next/link";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where:   { id: params.id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, features: { orderBy: { sortOrder: "asc" } }, links: true },
    }),
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="text-sm" style={{ color: "var(--text-muted)" }}>← Projects</Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <h1 className="font-display text-2xl font-bold">Edit: {project.title_en}</h1>
      </div>
      <ProjectForm project={project} categories={categories} />
    </div>
  );
}
