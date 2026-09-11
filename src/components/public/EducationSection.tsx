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
    <section id="education" style={{ padding:"4.25rem 0", ...bgStyle }}>
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

        <div style={{ position:"relative", paddingInlineStart:"1.75rem", borderInlineStart:"1px solid var(--border)" }}>
          {items.map((edu, idx) => {
            const e = edu as unknown as Record<string, unknown>;
            const honors  = (e[`honors_${locale}`] as string[] | undefined)?.length ? (e[`honors_${locale}`] as string[])  : (e.honors_en as string[] | undefined);
            const courses = (e[`courses_${locale}`] as string[] | undefined)?.length ? (e[`courses_${locale}`] as string[]) : (e.courses_en as string[] | undefined);
            return (
              <div key={edu.id} className="reveal" style={{ position:"relative", marginBottom: idx===items.length-1?"0":"2.5rem", transitionDelay:`${idx*0.1}s`, minWidth:0 }}>
                <span aria-hidden style={{ position:"absolute", insetInlineStart:"-2.03rem", top:"0.45rem", width:"9px", height:"9px", borderRadius:"50%", background: e.isCurrent ? "#4f46e5" : "var(--border-hover)", outline:"3px solid var(--bg-primary)" }} />

                <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-muted)", marginBottom:"0.3rem" }}>
                  {edu.startYear} — {e.isCurrent ? tl("present") : edu.endYear ?? tl("present")}{edu.location ? ` · ${edu.location}` : ""}
                </p>

                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", minWidth:0, marginBottom:"0.15rem" }}>
                  {e.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.logoUrl as string} alt="" style={{ width:"28px", height:"28px", borderRadius:"6px", objectFit:"cover", flexShrink:0, background:"#fff" }} />
                  ) : (
                    <span aria-hidden style={{ fontSize:"1.2rem", flexShrink:0 }}>{edu.icon}</span>
                  )}
                  <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(1.05rem,2.2vw,1.2rem)", lineHeight:1.3, wordBreak:"break-word", minWidth:0 }}>
                    {pick(edu as Record<string,unknown>,"degree",locale)}
                    {e.featured ? <span title={tl("featured")} style={{ fontSize:"0.8rem", marginInlineStart:"0.35rem" }}>⭐</span> : null}
                  </h3>
                </div>
                <p style={{ fontSize:"0.95rem", fontWeight:500, color:"var(--text-secondary)", marginBottom:"0.7rem", wordBreak:"break-word" }}>
                  {pick(edu as Record<string,unknown>,"institution",locale)}
                </p>
                {edu.gpa && (
                  <p style={{ fontSize:"0.78rem", color:"#06b6d4", fontWeight:600, marginBottom:"0.5rem" }}>
                    {tl("gpa")}: {edu.gpa}
                  </p>
                )}
                {pick(edu as Record<string,unknown>,"description",locale) && (
                  <p style={{ fontSize:"0.92rem", lineHeight:1.75, color:"var(--text-secondary)", margin:"0 0 0.75rem", wordBreak:"break-word", maxWidth:"62ch" }}>
                    {pick(edu as Record<string,unknown>,"description",locale)}
                  </p>
                )}
                {courses && courses.length > 0 && (
                  <p style={{ fontSize:"0.85rem", color:"var(--text-muted)", lineHeight:1.7, marginBottom:"0.6rem", wordBreak:"break-word" }}>
                    {courses.join(" · ")}
                  </p>
                )}
                {honors && honors.length > 0 && (
                  <ul style={{ margin:0, paddingInlineStart:"1.1rem", display:"flex", flexDirection:"column", gap:"0.25rem" }}>
                    {honors.map((h, i) => (
                      <li key={i} style={{ fontSize:"0.85rem", color:"var(--text-muted)", lineHeight:1.6 }}>{h}</li>
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
