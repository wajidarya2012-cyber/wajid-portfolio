import { prisma } from "@/lib/prisma";
import ExperienceManager from "./ExperienceManager";

export const metadata = { title: "Experience | Admin" };

export default async function ExperiencePage() {
  const experience = await prisma.experience.findMany({ orderBy: { sortOrder:"asc" } });
  return (
    <div style={{ maxWidth:"860px" }}>
      <div style={{ marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Work Experience</h1>
          <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage your professional timeline.</p>
        </div>
      </div>
      <ExperienceManager initialData={experience} />
    </div>
  );
}
