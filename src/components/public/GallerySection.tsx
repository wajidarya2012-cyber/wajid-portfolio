"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { splitTitle }      from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  const val = obj[`${field}_${locale}`] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[`${field}_en`] as string)) ?? "";
}

export type GallerySectionConfig = {
  title_en?: string; title_ps?: string; title_fa?: string;
  subtitle_en?: string; subtitle_ps?: string; subtitle_fa?: string;
  description_en?: string; description_ps?: string; description_fa?: string;
  visible?: boolean;
  order?: number;
  background?: "default" | "transparent" | "gradient";
};

export default function GallerySection({ items, locale, config }: { items: any[]; locale: string; config?: GallerySectionConfig }) {
  const tl  = useTranslations("gallery");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (config?.visible === false) return null;

  const homepageItems = items
    .filter(i => i.visible !== false && i.showOnHomepage !== false)
    .slice(0, 8);

  if (homepageItems.length === 0) return null;

  const customTitle = config ? pick(config as unknown as Record<string,unknown>, "title", locale) : "";
  const subtitle     = config ? pick(config as unknown as Record<string,unknown>, "subtitle", locale) : "";
  const description = config ? pick(config as unknown as Record<string,unknown>, "description", locale) : "";
  const titleParts = splitTitle(tl("title"), tl("titleHighlight"));
  const sparse = homepageItems.length <= 3;
  const bg = config?.background ?? "default";
  const bgStyle: React.CSSProperties =
    bg === "transparent" ? { background:"transparent" } :
    bg === "gradient"    ? { background:"linear-gradient(180deg, var(--bg-secondary) 0%, rgba(79,70,229,0.06) 50%, var(--bg-secondary) 100%)" } :
    { background:"var(--bg-secondary)" };

  return (
    <section id="gallery" style={{ padding: sparse ? "3.25rem 0" : "4.25rem 0", ...bgStyle }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">
          {customTitle ? customTitle : titleParts ? <>{titleParts.before}<span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{titleParts.match}</span>{titleParts.after}</> : tl("title")}
        </h2>
        {subtitle && (
          <p className="reveal reveal-delay-1" style={{ fontSize:"clamp(0.95rem,1.8vw,1.1rem)", color:"var(--text-secondary)", fontWeight:500, marginTop:"-0.5rem", marginBottom:"0.5rem" }}>
            {subtitle}
          </p>
        )}
        <div className="divider reveal reveal-delay-2" />
        {description && (
          <p className="reveal reveal-delay-2" style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginBottom:"2rem", maxWidth:"520px" }}>
            {description}
          </p>
        )}

        <div className="reveal reveal-delay-3" style={ sparse
          ? { display:"flex", flexWrap:"wrap", gap:"0.75rem", marginBottom:"1.5rem" }
          : { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"0.75rem", marginBottom:"1.75rem" } }>
          {homepageItems.map(item => (
            <Link key={item.id} href={`/${locale}/gallery`} style={{ position:"relative", borderRadius:"10px", overflow:"hidden", aspectRatio:"1/1", display:"block", border:"1px solid var(--border)", ...(sparse ? { width:"clamp(120px,28vw,168px)", flexShrink:0 } : {}) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={pick(item,"altText",locale) || pick(item,"title",locale) || ""} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </Link>
          ))}
        </div>

        <Link href={`/${locale}/gallery`} className="btn-secondary reveal reveal-delay-3" style={{ display:"inline-flex", fontSize:"0.85rem" }}>
          {tl("viewFullGallery")} →
        </Link>
      </div>
    </section>
  );
}
