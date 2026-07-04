"use client";

import { useEffect, useRef } from "react";
import { useTranslations }   from "next-intl";
import type { Education }    from "@/types";

function pick(obj: Record<string,unknown>, field: string, locale: string): string {
  return ((obj[`${field}_${locale}`] ?? obj[`${field}_en`] ?? "") as string);
}

export default function EducationSection({ education, locale }: { education: Education[]; locale: string }) {
  const tl  = useTranslations("education");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold:0.08 });
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" style={{ padding:"5.5rem 0", background:"var(--bg-primary)" }}>
      <div className="section-container" ref={ref}>
        <span className="section-eyebrow reveal">{tl("eyebrow")}</span>
        <h2 className="section-title reveal reveal-delay-1">
          Education &amp;{" "}
          <span style={{ background:"linear-gradient(135deg,#4f46e5,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Qualifications
          </span>
        </h2>
        <div className="divider reveal reveal-delay-2" style={{ marginBottom:"2.5rem" }} />

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))", gap:"1.25rem" }}>
          {education.map((edu, idx) => (
            <div key={edu.id} className="glass-card reveal" style={{ borderRadius:"16px", padding:"clamp(1.25rem,3vw,1.75rem)", transition:"all 0.25s", transitionDelay:`${idx*0.1}s`, minWidth:0, display:"flex", flexDirection:"column" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-4px)"; el.style.borderColor="rgba(79,70,229,0.4)"; el.style.boxShadow="0 12px 32px rgba(79,70,229,0.15)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.transform="none"; el.style.borderColor="var(--border)"; el.style.boxShadow="var(--shadow-card)"; }}>

              {/* Icon */}
              <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.08))", border:"1px solid rgba(79,70,229,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", marginBottom:"1rem", flexShrink:0 }}>
                {edu.icon}
              </div>

              <h3 style={{ fontFamily:"var(--font-syne)", fontWeight:700, fontSize:"clamp(0.9rem,2vw,1rem)", marginBottom:"0.35rem", wordBreak:"break-word", lineHeight:1.3 }}>
                {pick(edu as Record<string,unknown>,"degree",locale)}
              </h3>
              <p style={{ fontWeight:600, fontSize:"0.85rem", color:"#818cf8", marginBottom:"0.25rem", wordBreak:"break-word" }}>
                {pick(edu as Record<string,unknown>,"institution",locale)}
              </p>
              <p style={{ fontFamily:"var(--font-fira)", fontSize:"0.7rem", color:"var(--text-muted)", marginBottom:"0.875rem" }}>
                {edu.startYear} — {edu.endYear ?? "Present"}{edu.location ? ` · ${edu.location}` : ""}
              </p>
              {edu.gpa && (
                <p style={{ fontSize:"0.78rem", color:"#06b6d4", fontWeight:600, marginBottom:"0.5rem" }}>
                  GPA: {edu.gpa}
                </p>
              )}
              {pick(edu as Record<string,unknown>,"description",locale) && (
                <p style={{ fontSize:"0.82rem", lineHeight:1.75, color:"var(--text-secondary)", margin:0, wordBreak:"break-word" }}>
                  {pick(edu as Record<string,unknown>,"description",locale)}
                </p>
              )}
            </div>
          ))}
          {education.length===0 && (
            <p style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>No education entries yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}