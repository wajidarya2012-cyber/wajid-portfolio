"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { SkillCategoryWithSkills } from "@/types";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
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
  const layout = config?.layout ?? "grid";
  const bg     = config?.background ?? "default";

  const bgStyle: React.CSSProperties =
    bg === "transparent" ? { background:"transparent" } :
    bg === "gradient"    ? { background:"linear-gradient(180deg, var(--bg-primary) 0%, rgba(79,70,229,0.06) 50%, var(--bg-primary) 100%)" } :
    bg === "image" && config?.backgroundImage ? { background:"var(--bg-primary)", position:"relative" } :
    { background:"var(--bg-primary)" };

  return (
    <section id="skills" style={{ padding:"5.5rem 0", ...bgStyle }}>
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
            Skills &amp;{" "}
            <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Technologies
            </span>
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
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(79,70,229,0.4)"; el.style.boxShadow = "0 8px 32px rgba(79,70,229,0.15)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow-card)"; }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
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
                          {skill.featured && <span title="Featured" style={{ fontSize:"0.65rem" }}>⭐</span>}
                        </span>
                        <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", color:"#06b6d4", flexShrink:0 }}>
                          {skill.percentage}%
                        </span>
                      </div>
                      <div style={{ height:"5px", borderRadius:"3px", background:"var(--border)", overflow:"hidden" }}>
                        <div className="skill-bar-fill" style={{ "--target-width": `${skill.percentage}%` } as React.CSSProperties} />
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
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
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
                      <span style={{ color:"#06b6d4", fontFamily:"var(--font-fira)", fontSize:"0.68rem" }}>{skill.percentage}%</span>
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
                      <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.75rem", color:"#06b6d4", fontWeight:600 }}>{skill.percentage}%</span>
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
