"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ImageLightbox, { type LightboxImage } from "./ImageLightbox";

// Standalone project detail page's image viewer — reuses the same ImageLightbox already
// used by ProjectsSection's homepage modal and the /gallery page, instead of a second
// bespoke implementation. Each trigger below opens the lightbox over the *full* image list
// (so prev/next can browse every project image regardless of which thumbnail was clicked),
// starting at its own index.

export function ProjectFeaturedImage({
  images, index, alt,
}: {
  images: LightboxImage[];
  index: number;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(index);
  const img = images[index];
  if (!img) return null;
  return (
    <>
      <button type="button" onClick={() => { setLightboxIndex(index); setOpen(true); }}
        aria-label={`View full-size image — ${alt}`}
        style={{ display:"block", width:"100%", padding:0, border:"1px solid var(--border)", borderRadius:"16px", overflow:"hidden", marginBottom:"2rem", cursor:"zoom-in", background:"none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={alt} style={{ width:"100%", display:"block" }} />
      </button>
      {open && (
        <ImageLightbox images={images} index={lightboxIndex} onClose={() => setOpen(false)} onIndexChange={setLightboxIndex} />
      )}
    </>
  );
}

export default function ProjectImageGrid({
  images, title,
}: {
  images: LightboxImage[];
  title: string;
}) {
  const t = useTranslations("projects");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (images.length <= 1) return null;

  return (
    <div style={{ marginBottom:"1.75rem" }}>
      <h2 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"1rem", color:"#06b6d4", marginBottom:"0.875rem" }}>🖼 {t("gallery")}</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"0.75rem" }}>
        {images.map((img, i) => (
          <button key={img.id} type="button" onClick={() => setLightboxIndex(i)}
            aria-label={`View image ${i + 1} of ${images.length} — ${title}`}
            style={{ padding:0, border:"1px solid var(--border)", borderRadius:"10px", overflow:"hidden", cursor:"zoom-in", background:"none", aspectRatio:"16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption ?? ""} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onIndexChange={setLightboxIndex} />
      )}
    </div>
  );
}
