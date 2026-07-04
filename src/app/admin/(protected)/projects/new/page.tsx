import { prisma }    from "@/lib/prisma";
import ProjectForm   from "@/components/admin/ProjectForm";
import Link          from "next/link";

export default async function NewProjectPage() {
  const categories = await prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="text-sm" style={{ color: "var(--text-muted)" }}>← Projects</Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <h1 className="font-display text-2xl font-bold">New Project</h1>
      </div>
      <ProjectForm categories={categories} />
    </div>
  );
}
