"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { SkillCategoryWithSkills } from "@/types";
import { splitTitle }        from "@/lib/utils";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

// Phase 33: public skill rendering shows a named proficiency tier instead of a
// percentage + progress bar. The Skill.percentage column and its admin input are
// unchanged - this is presentation only. Single place to tune the thresholds.
function levelKey(percentage: number): "expert" | "advanced" | "proficient" | "familiar" {
  if (percentage >= 90) return "expert";
  if (percentage >= 75) return "advanced";
  if (percentage >= 55) return "proficient";
  return "familiar";
}

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  const val = obj[`${field}_${locale}`] as string | undefined;
  return (val && val.trim() !== "" ? val : (obj[`${field}_en`] as string)) ?? "";
}

export type SkillsSectionConfig = {
  title_en?: string; title_ps?: string; title_fa?: string;
  subtitle_en?: string; subtitle_ps?: string; subtitle_fa?: string;
  description_en?: string; description_ps?: string; description_fa?: string;
  visible?: boolean;
  order?: number;
  layout?: "grid" | "cards" | "compact";
  background?: "default" | "transparent" | "gradient" | "image";
  backgroundImage?: string;
};

export default function SkillsSection({ categories, locale, config }: { categories: SkillCategoryWithSkills[]; locale: string; config?: SkillsSectionConfig }) {
  const tl      = useTranslations("skills");
  const ref     = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Skill bar animation
  useEffect(() => {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll<HTMLElement>(".skill-bar-fill").forEach(el => {
            el.classList.add("animate");
          });
        }
      });
    }, { threshold: 0.2 });
    if (gridRef.current) barObserver.observe(gridRef.current);
    return () => barObserver.disconnect();
  }, []);

  if (config?.visible === false) return null;

  const visibleCategories = categories
    .filter(c => (c as unknown as { visible?: boolean }).visible !== false)
    .map(c => ({ ...c, skills: c.skills.filter(s => (s as unknown as { visible?: boolean }).visible !== false) }));

  const customTitle       = config ? pick(config as unknown as Record<string,unknown>, "title", locale) : "";
  const subtitle           = config ? pick(config as unknown as Record<string,unknown>, "subtitle", locale) : "";
  const customDescription = config ? pick(config as unknown as Record<string,unknown>, "description", locale) : "";
  const titleParts = splitTitle(tl("title"), tl("titleHighlight"));
  const layout = config?.layout ?? "grid";
  const bg     = config?.background ?? "default";

  const bgStyle: React.CSSProperties =
    bg === "transparent" ? { background:"transparent" } :
    bg === "gradient"    ? { background:"linear-gradient(180deg, var(--bg-primary) 0%, rgba(79,70,229,0.06) 50%, var(--bg-primary) 100%)" } :
    bg === "image" && config?.backgroundImage ? { background:"var(--bg-primary)", position:"relative" } :
    { background:"var(--bg-primary)" };

  return (
    <section id="skills" style={{ padding:"4.25rem 0", ...bgStyle }}>
      {bg === "image" && config?.backgroundImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.backgroundImage} alt="" aria-hidden="true" loading="lazy"
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.14 }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, var(--bg-primary) 0%, rgba(0,0,0,0.15) 40%, var(--bg-primary) 100%)" }} />
        </>
      )}
      <div className="section-container" ref={ref} style={{ position:"relative", zIndex:1 }}>
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
        <div className="divider reveal reveal-delay-2" />
        <p className="reveal reveal-delay-3" style={{ color:"var(--text-secondary)", fontSize:"0.95rem", marginBottom:"2.5rem", maxWidth:"520px" }}>
          {customDescription || tl("desc")}
        </p>

        {/* GRID layout (default) */}
        {layout === "grid" && (
          <div ref={gridRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))", gap:"1.25rem" }}>
            {visibleCategories.map((cat, idx) => (
              <div key={cat.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"1.5rem", transition:"all 0.25s", transitionDelay:`${idx * 0.08}s`, minWidth:0 }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border-hover)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow-card)"; }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
                    {cat.icon}
                  </div>
                  <span style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.88rem", wordBreak:"break-word", minWidth:0 }}>
                    {pick(cat as Record<string,unknown>, "name", locale)}
                  </span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                  {cat.skills.map(skill => (
                    <div key={skill.id}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.32rem", gap:"0.5rem" }}>
                        <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)", wordBreak:"break-word", minWidth:0, flex:1, display:"flex", alignItems:"center", gap:"0.35rem" }}>
                          {skill.icon && <span>{skill.icon}</span>}
                          {pick(skill as Record<string,unknown>, "name", locale)}
                          {skill.featured && <span title={tl("featured")} style={{ fontSize:"0.65rem" }}>⭐</span>}
                        </span>
                        <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", flexShrink:0 }}>
                          {tl(`level.${levelKey(skill.percentage)}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CARDS layout — skills as pill badges with inline percentage */}
        {layout === "cards" && (
          <div ref={gridRef} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            {visibleCategories.map((cat, idx) => (
              <div key={cat.id} className="glass-card reveal" style={{ borderRadius:"18px", padding:"1.5rem", transitionDelay:`${idx * 0.08}s` }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"var(--bg-secondary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
                    {cat.icon}
                  </div>
                  <span style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.95rem" }}>
                    {pick(cat as Record<string,unknown>, "name", locale)}
                  </span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.6rem" }}>
                  {cat.skills.map(skill => (
                    <span key={skill.id} className="tag-badge" style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem" }}>
                      {skill.icon && <span>{skill.icon}</span>}
                      {pick(skill as Record<string,unknown>, "name", locale)}
                      {skill.featured && <span style={{ fontSize:"0.65rem" }}>⭐</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPACT layout — dense single-line rows, no bars */}
        {layout === "compact" && (
          <div ref={gridRef} className="glass-card reveal" style={{ borderRadius:"18px", padding:"clamp(1.25rem,3vw,2rem)" }}>
            {visibleCategories.map((cat, idx) => (
              <div key={cat.id} style={{ marginBottom: idx === visibleCategories.length-1 ? 0 : "1.5rem" }}>
                <p style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.85rem", marginBottom:"0.6rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <span>{cat.icon}</span> {pick(cat as Record<string,unknown>, "name", locale)}
                </p>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {cat.skills.map((skill, sIdx) => (
                    <div key={skill.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.55rem 0", borderBottom: sIdx === cat.skills.length-1 ? "none" : "1px solid var(--border)" }}>
                      <span style={{ fontSize:"0.82rem", color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                        {skill.icon && <span>{skill.icon}</span>}
                        {pick(skill as Record<string,unknown>, "name", locale)}
                        {skill.featured && <span style={{ fontSize:"0.65rem" }}>⭐</span>}
                      </span>
                      <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{tl(`level.${levelKey(skill.percentage)}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
