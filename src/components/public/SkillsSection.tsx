"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { SkillCategoryWithSkills } from "@/types";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function SkillsSection({ categories, locale }: { categories: SkillCategoryWithSkills[]; locale: string }) {
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

  return (
    <section id="skills" style={{ padding:"5.5rem 0", background:"var(--bg-primary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">
          Skills &amp;{" "}
          <span style={{ background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Technologies
          </span>
        </h2>
        <div className="divider reveal reveal-delay-2" />
        <p className="reveal reveal-delay-3" style={{ color:"var(--text-secondary)", fontSize:"0.95rem", marginBottom:"2.5rem", maxWidth:"520px" }}>
          {tl("desc")}
        </p>

        <div ref={gridRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))", gap:"1.25rem" }}>
          {categories.map((cat, idx) => (
            <div key={cat.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"1.5rem", transition:"all 0.25s", transitionDelay:`${idx * 0.08}s`, minWidth:0 }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(79,70,229,0.4)"; el.style.boxShadow = "0 8px 32px rgba(79,70,229,0.15)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow-card)"; }}>

              {/* Category header */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.25rem" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
                  {cat.icon}
                </div>
                <span style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"0.88rem", wordBreak:"break-word", minWidth:0 }}>
                  {pick(cat as Record<string,unknown>, "name", locale)}
                </span>
              </div>

              {/* Skills */}
              <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                {cat.skills.map(skill => (
                  <div key={skill.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.32rem", gap:"0.5rem" }}>
                      <span style={{ fontSize:"0.8rem", color:"var(--text-secondary)", wordBreak:"break-word", minWidth:0, flex:1 }}>
                        {pick(skill as Record<string,unknown>, "name", locale)}
                      </span>
                      <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", color:"#06b6d4", flexShrink:0 }}>
                        {skill.percentage}%
                      </span>
                    </div>
                    <div style={{ height:"5px", borderRadius:"3px", background:"var(--border)", overflow:"hidden" }}>
                      <div
                        className="skill-bar-fill"
                        style={{ "--target-width": `${skill.percentage}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}