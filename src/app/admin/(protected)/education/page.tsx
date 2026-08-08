import { prisma } from "@/lib/prisma";
import EducationManager from "./EducationManager";
export const metadata = { title: "Education | Admin" };
export default async function EducationPage() {
  const [education, sectionSetting] = await Promise.all([
    prisma.education.findMany({ orderBy:{ sortOrder:"asc" } }),
    prisma.siteSettings.findUnique({ where: { key: "education_section_config" } }),
  ]);
  let sectionConfig = {};
  try { sectionConfig = sectionSetting?.value ? JSON.parse(sectionSetting.value) : {}; } catch {}

  return (
    <div style={{ maxWidth:"960px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Education</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage your academic background and training.</p>
      </div>
      <EducationManager initialData={education} initialSectionConfig={sectionConfig} />
    </div>
  );
}
