import { prisma } from "@/lib/prisma";
import GalleryManager from "./GalleryManager";
export const metadata = { title: "Gallery | Admin" };
export default async function GalleryPage() {
  const [items, settings] = await Promise.all([
    prisma.galleryItem.findMany({ orderBy:{ sortOrder:"asc" } }),
    prisma.siteSettings.findMany({ where: { key: { in: ["gallery_albums", "gallery_section_config"] } } }),
  ]);
  const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
  let albums: { slug:string; name_en:string; name_ps:string; name_fa:string }[] = [];
  let sectionConfig: Record<string, unknown> = {};
  try { albums = map.gallery_albums ? JSON.parse(map.gallery_albums) : []; } catch {}
  try { sectionConfig = map.gallery_section_config ? JSON.parse(map.gallery_section_config) : {}; } catch {}

  return (
    <div style={{ maxWidth:"1000px" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.5rem", fontWeight:800, marginBottom:"0.25rem" }}>Gallery</h1>
        <p style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Upload and organize photos into albums, shown on the homepage and the full Gallery page.</p>
      </div>
      <GalleryManager initialItems={items} initialAlbums={albums} initialSectionConfig={sectionConfig} />
    </div>
  );
}
