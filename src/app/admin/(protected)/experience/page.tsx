import { prisma } from "@/lib/prisma";
import ExperienceManager from "./ExperienceManager";

export const metadata = { title: "Experience | Admin" };

export default async function ExperiencePage() {
  const [items, sectionSetting] = await Promise.all([
    prisma.experience.findMany({ orderBy: { sortOrder:"asc" } }),
    prisma.siteSettings.findUnique({ where: { key: "experience_section_config" } }),
  ]);
  let sectionConfig = {};
  try { sectionConfig = sectionSetting?.value ? JSON.parse(sectionSetting.value) : {}; } catch {}

  return (
    <div style={{ maxWidth:"900px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Experience</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage your work history and career timeline.</p>
      </div>
      <ExperienceManager initialData={items} initialSectionConfig={sectionConfig} />
    </div>
  );
}
