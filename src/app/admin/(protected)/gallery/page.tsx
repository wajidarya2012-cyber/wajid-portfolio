import { prisma } from "@/lib/prisma";
import GalleryManager from "./GalleryManager";
export const metadata = { title: "Gallery | Admin" };
export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy:{ sortOrder:"asc" } });
  return (
    <div style={{ maxWidth:"1000px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Gallery</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Upload and organize photos by category.</p>
      </div>
      <GalleryManager initialItems={items} />
    </div>
  );
}
