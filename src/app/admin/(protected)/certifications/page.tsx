import { prisma } from "@/lib/prisma";
import CertManager from "./CertManager";
export const metadata = { title: "Certifications | Admin" };
export default async function CertificationsPage() {
  const certs = await prisma.certification.findMany({ orderBy:{ sortOrder:"asc" } });
  return (
    <div style={{ maxWidth:"860px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Certifications</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Manage your professional certifications and training credentials.</p>
      </div>
      <CertManager initialData={certs} />
    </div>
  );
}
