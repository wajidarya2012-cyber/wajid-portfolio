"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { Education }    from "@/types";
import { splitTitle }        from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  const val = obj[`${field}_${locale}`] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[`${field}_en`] as string)) ?? "";
}

export type EducationSectionConfig = {
  title_en?: string; title_ps?: string; title_fa?: string;
  subtitle_en?: string; subtitle_ps?: string; subtitle_fa?: string;
  description_en?: string; description_ps?: string; description_fa?: string;
  visible?: boolean;
  order?: number;
  background?: "default" | "transparent" | "gradient";
};

export default function EducationSection({ education, locale, config }: { education: Education[]; locale: string; config?: EducationSectionConfig }) {
  const tl  = useTranslations("education");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (config?.visible === false) return null;

  const items = education
    .filter(e => (e as unknown as { visible?: boolean }).visible !== false)
    .sort((a, b) => {
      const fa = (a as unknown as { featured?: boolean }).featured ? 1 : 0;
      const fb = (b as unknown as { featured?: boolean }).featured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return a.sortOrder - b.sortOrder;
    });

  const customTitle       = config ? pick(config as unknown as Record<string,unknown>, "title", locale) : "";
  const subtitle           = config ? pick(config as unknown as Record<string,unknown>, "subtitle", locale) : "";
  const customDescription = config ? pick(config as unknown as Record<string,unknown>, "description", locale) : "";
  const titleParts = splitTitle(tl("title"), tl("titleHighlight"));
  const bg = config?.background ?? "default";
  const bgStyle: React.CSSProperties =
    bg === "transparent" ? { background:"transparent" } :
    bg === "gradient"    ? { background:"linear-gradient(180deg, var(--bg-primary) 0%, rgba(79,70,229,0.06) 50%, var(--bg-primary) 100%)" } :
    { background:"var(--bg-primary)" };

  return (
    <section id="education" style={{ padding:"5.5rem 0", ...bgStyle }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        {customTitle ? (
          <h2 className="section-title reveal reveal-delay-1">{customTitle}</h2>
        ) : (
          <h2 className="section-title reveal reveal-delay-1">
            {titleParts ? <>{titleParts.before}<span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{titleParts.match}</span>{titleParts.after}</> : tl("title")}
          </h2>
        )}
        {subtitle && (
          <p className="reveal reveal-delay-1" style={{ fontSize:"clamp(0.95rem,1.8vw,1.1rem)", color:"var(--text-secondary)", fontWeight:500, marginTop:"-0.5rem", marginBottom:"0.5rem" }}>
            {subtitle}
          </p>
        )}
        <div className="divider reveal reveal-delay-2" style={{ marginBottom: customDescription ? "1rem" : "2.5rem" }} />
        {customDescription && (
          <p className="reveal reveal-delay-2" style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginBottom:"2.5rem", maxWidth:"560px" }}>
            {customDescription}
          </p>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))", gap:"1.25rem" }}>
          {items.map((edu, idx) => {
            const e = edu as unknown as Record<string, unknown>;
            const honors  = (e[`honors_${locale}`] as string[] | undefined)?.length ? (e[`honors_${locale}`] as string[])  : (e.honors_en as string[] | undefined);
            const courses = (e[`courses_${locale}`] as string[] | undefined)?.length ? (e[`courses_${locale}`] as string[]) : (e.courses_en as string[] | undefined);
            return (
              <div key={edu.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"clamp(1.25rem,3vw,1.75rem)", transition:"all 0.25s", transitionDelay:`${idx*0.1}s`, minWidth:0, display:"flex", flexDirection:"column" }}
                onMouseEnter={ev=>{ const el=ev.currentTarget as HTMLElement; el.style.transform="translateY(-4px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 12px 32px rgba(79,70,229,0.15)"; }}
                onMouseLeave={ev=>{ const el=ev.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>

                {/* Icon / Logo */}
                {e.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.logoUrl as string} alt="" style={{ width:"52px", height:"52px", borderRadius:"14px", objectFit:"cover", marginBottom:"1rem", flexShrink:0, background:"#fff" }} />
                ) : (
                  <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", marginBottom:"1rem", flexShrink:0 }}>
                    {edu.icon}
                  </div>
                )}

                <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.9rem,2vw,1rem)", marginBottom:"0.35rem", wordBreak:"break-word", lineHeight:1.3 }}>
                  {pick(edu as Record<string,unknown>,"degree",locale)} {e.featured ? <span title={tl("featured")} style={{ fontSize:"0.75rem" }}>⭐</span> : null}
                </h3>
                <p style={{ fontWeight:600, fontSize:"0.85rem", color:"#818cf8", marginBottom:"0.25rem", wordBreak:"break-word" }}>
                  {pick(edu as Record<string,unknown>,"institution",locale)}
                </p>
                <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", color:"var(--text-muted)", marginBottom:"0.875rem" }}>
                  {edu.startYear} — {e.isCurrent ? tl("present") : edu.endYear ?? tl("present")}{edu.location ? ` · ${edu.location}` : ""}
                </p>
                {edu.gpa && (
                  <p style={{ fontSize:"0.78rem", color:"#06b6d4", fontWeight:600, marginBottom:"0.5rem" }}>
                    {tl("gpa")}: {edu.gpa}
                  </p>
                )}
                {pick(edu as Record<string,unknown>,"description",locale) && (
                  <p style={{ fontSize:"0.82rem", lineHeight:1.75, color:"var(--text-secondary)", margin:"0 0 0.75rem", wordBreak:"break-word" }}>
                    {pick(edu as Record<string,unknown>,"description",locale)}
                  </p>
                )}
                {courses && courses.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", marginBottom:"0.6rem" }}>
                    {courses.map(c => <span key={c} className="tag-badge" style={{ fontSize:"0.65rem" }}>{c}</span>)}
                  </div>
                )}
                {honors && honors.length > 0 && (
                  <ul style={{ margin:0, paddingLeft:"1.1rem", display:"flex", flexDirection:"column", gap:"0.25rem" }}>
                    {honors.map((h, i) => (
                      <li key={i} style={{ fontSize:"0.76rem", color:"var(--text-muted)", lineHeight:1.6 }}>🏅 {h}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {items.length===0 && (
            <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>{tl("noEntries")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
