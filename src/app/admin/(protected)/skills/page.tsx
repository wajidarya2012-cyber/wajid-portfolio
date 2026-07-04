import { prisma } from "@/lib/prisma";
import SkillsManager from "./SkillsManager";

export const metadata = { title: "Skills | Admin" };

export default async function SkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    include: { skills: { orderBy: { sortOrder:"asc" } } },
    orderBy: { sortOrder:"asc" },
  });
  return (
    <div style={{ maxWidth:"900px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Skills</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage skill categories and individual skills with proficiency levels.</p>
      </div>
      <SkillsManager initialCategories={categories} />
    </div>
  );
}
