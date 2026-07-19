import { prisma } from "@/lib/prisma";
import JourneyManager from "./JourneyManager";

export const metadata = { title: "Professional Journey | Admin" };

export default async function JourneyPage() {
  const slides = await prisma.journeySlide.findMany({ orderBy:{ sortOrder:"asc" } });
  return (
    <div style={{ maxWidth:"1000px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Professional Journey</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage the homepage journey slideshow — shown between Certifications and Projects.</p>
      </div>
      <JourneyManager initialData={slides} />
    </div>
  );
}
