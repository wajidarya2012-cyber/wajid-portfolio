"use client";

import { useEffect, useRef }  from "react";
import { useTranslations }    from "next-intl";
import type { Experience }    from "@/types";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}
function fmtYear(date: Date|string): string {
  try { return new Date(date).getFullYear().toString(); } catch { return ""; }
}

export default function ExperienceSection({ experience, locale }: { experience:Experience[]; locale:string }) {
  const tl  = useTranslations("experience");
  const safeLocale = ["en","ps","fa"].includes(locale) ? locale : "en";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" style={{ padding:"5.5rem 0", background:"var(--bg-secondary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">Work <span style={{ background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Experience</span></h2>
        <div className="divider reveal reveal-delay-2" style={{ marginBottom:"2.5rem" }} />

        <div style={{ position:"relative", paddingLeft:"1.5rem", borderLeft:"2px solid rgba(79,70,229,0.3)" }}>
          {experience.map((exp, idx) => (
            <div key={exp.id} className="reveal" style={{ position:"relative", marginBottom: idx===experience.length-1?"0":"2.25rem", transitionDelay:`${idx*0.1}s` }}>
              {/* Dot */}
              <div style={{ position:"absolute", left:"-2.25rem", top:"1.25rem", width:"14px", height:"14px", borderRadius:"50%", background:"linear-gradient(135deg,#4f46e5,#06b6d4)", boxShadow:"0 0 0 4px rgba(79,70,229,0.18)", flexShrink:0 }} />

              <div className="glass-card" style={{ borderRadius:"16px", padding:"clamp(1rem,3vw,1.5rem)", marginLeft:"0.5rem", transition:"all 0.25s", minWidth:0, overflow:"hidden" }}
                onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="translateX(4px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 8px 28px rgba(79,70,229,0.12)"; }}
                onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>

                <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:"0.5rem", marginBottom:"0.5rem" }}>
                  <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.95rem,2vw,1.05rem)", wordBreak:"break-word", minWidth:0, flex:1 }}>
                    {pick(exp as Record<string,unknown>,"role",safeLocale)}
                  </h3>
                  <span style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", padding:"0.22rem 0.75rem", borderRadius:"9999px", background:"rgba(79,70,229,0.1)", border:"1px solid rgba(79,70,229,0.25)", color:"#06b6d4", whiteSpace:"nowrap", flexShrink:0 }}>
                    {fmtYear(exp.startDate)} — {exp.isCurrent ? tl("present") : exp.endDate ? fmtYear(exp.endDate) : ""}
                  </span>
                </div>

                <p style={{ fontWeight:600, fontSize:"0.875rem", color:"#818cf8", marginBottom:"0.75rem", wordBreak:"break-word" }}>
                  {pick(exp as Record<string,unknown>,"organization",safeLocale)}
                </p>

                <p style={{ fontSize:"0.875rem", lineHeight:1.8, color:"var(--text-secondary)", marginBottom:"1rem", wordBreak:"break-word" }}>
                  {pick(exp as Record<string,unknown>,"description",safeLocale)}
                </p>

                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {exp.technologies.map(tech => (
                    <span key={tech} className="accent-badge" style={{ fontSize:"0.68rem" }}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {experience.length===0 && (
            <p style={{ color:"var(--text-muted)", fontSize:"0.875rem", padding:"2rem 0.5rem" }}>No experience entries yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}