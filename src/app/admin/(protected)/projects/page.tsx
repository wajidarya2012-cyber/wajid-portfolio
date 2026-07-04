import { prisma }          from "@/lib/prisma";
import Link                 from "next/link";
import AdminProjectsClient  from "./AdminProjectsClient";

export default async function AdminProjectsPage() {
  const [projects, categories] = await Promise.all([
    prisma.project.findMany({
      include: { category: true, images: { where: { isThumbnail: true }, take: 1 } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div style={{ maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.2rem" }}>Projects</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{projects.length} total</p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary" style={{ fontSize: "0.85rem" }}>
          ➕ Add Project
        </Link>
      </div>
      <AdminProjectsClient projects={projects} categories={categories} />
    </div>
  );
}
